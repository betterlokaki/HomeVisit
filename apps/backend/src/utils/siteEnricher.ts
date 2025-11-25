/**
 * Site Data Enrichment Utilities
 *
 * Adds calculated fields to site data.
 */

import {
  union,
  intersect,
  area,
  feature,
  featureCollection,
  difference,
} from "@turf/turf";
import wkt from "wellknown";
import {
  SITE_STATUS_OPTIONS,
  STATUS_CALCULATION_DELAY_MS,
  SITE_LINK_DOMAIN,
  PROJECT_LINK_FORMAT,
} from "../config/constants.js";
import type { Site, UpdatedStatus as SnapshotStatus } from "@homevisit/common";
import { logger } from "../middleware/logger.js";
import { ElasticProviderOverlay } from "@homevisit/common/src/index.js";

/**
 * Calculate site status based on overlay intersection percentage
 * - Full: 100% coverage
 * - Partial: >0% and <100% coverage
 * - No: 0% coverage
 *
 * OPTIMIZED: Avoids expensive union operation on all overlays by:
 * 1. Early filtering of overlays that intersect with site bbox
 * 2. Incremental union (stop early if 100% coverage reached)
 * 3. Skip union entirely if single overlay
 */
export async function calcaulteIntersectionPrecent(
  site: Site,
  overlays: ElasticProviderOverlay[]
): Promise<SnapshotStatus> {
  try {
    if (!site.geometry || overlays.length === 0) {
      logger.debug("No geometry or overlays provided", {
        hasGeometry: !!site.geometry,
        overlayCount: overlays.length,
      });
      return "No";
    }

    // Parse site geometry - handle both GeoJSON objects and WKT strings
    let siteGeom: any;
    if (typeof site.geometry === "string") {
      siteGeom = wkt.parse(site.geometry);
    } else {
      siteGeom = site.geometry;
    }
    if (!siteGeom) {
      logger.warn("Failed to parse site geometry", { geometry: site.geometry });
      return "No";
    }
    const siteFeat = feature(siteGeom as any);
    const siteArea = area(siteFeat as any);

    if (siteArea === 0) {
      logger.warn("Site area is zero", { site: site.site_id });
      return "No";
    }

    // Quick bbox check: filter overlays to only those that could intersect
    const siteBbox = getBbox(siteFeat);
    const candidateOverlays = overlays.filter((overlay) => {
      try {
        const overlayGeom = wkt.parse((overlay.geo?.wkt || "") as any);
        if (!overlayGeom) return false;
        const overlayBbox = getBbox(feature(overlayGeom as any));
        // Check if bounding boxes overlap
        return bboxIntersect(siteBbox, overlayBbox);
      } catch {
        return false;
      }
    });

    if (candidateOverlays.length === 0) {
      logger.debug("No overlays intersect site bbox");
      return "No";
    }

    // Parse only candidate overlay geometries
    const overlayFeats = candidateOverlays
      .map((overlay: any) => {
        try {
          const geom = wkt.parse((overlay.geo?.wkt || "") as any);
          if (!geom) return null;
          return feature(geom as any);
        } catch (e) {
          logger.warn("Failed to parse overlay geometry", { overlay });
          return null;
        }
      })
      .filter((f) => f !== null) as any[];

    if (overlayFeats.length === 0) {
      logger.debug("No valid overlay geometries");
      return "No";
    }

    // OPTIMIZATION: Incremental union with early exit
    let unionedOverlay: any = overlayFeats[0];
    let currentIntersectionArea = 0;

    for (let i = 1; i < overlayFeats.length; i++) {
      try {
        unionedOverlay = union(
          featureCollection([unionedOverlay, overlayFeats[i]])
        );

        // Early exit: if we already have 100% coverage, stop unioning
        const testIntersection = intersect(
          featureCollection([siteFeat, unionedOverlay])
        );
        if (testIntersection) {
          currentIntersectionArea = area(testIntersection as any);
          if (
            Math.abs((currentIntersectionArea / siteArea) * 100 - 100) < 1e-9
          ) {
            logger.debug("Reached 100% coverage, stopping union early", {
              siteId: site.site_id,
              overlaysProcessed: i + 1,
              totalOverlays: overlayFeats.length,
            });
            break;
          }
        }
      } catch (e) {
        logger.warn("Failed to union overlay", { error: e });
      }
    }

    if (!unionedOverlay) {
      logger.debug("No valid unioned overlay");
      return "No";
    }

    // Calculate final intersection
    let p: any;
    try {
      p = intersect(featureCollection([siteFeat, unionedOverlay]));
    } catch (e) {
      logger.warn("Failed to calculate intersection", { error: e });
      return "No";
    }

    if (!p) {
      logger.debug("No intersection found between site and overlays");
      return "No";
    }

    // Calculate percentage coverage
    const intersectionArea = area(p as any);
    const coveragePercentage = (intersectionArea / siteArea) * 100;

    logger.debug("Calculated coverage percentage", {
      siteId: site.site_id,
      siteArea,
      intersectionArea,
      coveragePercentage: coveragePercentage.toFixed(2),
      overlaysProcessed: overlayFeats.length,
    });

    // Determine status based on coverage
    if (Math.abs(coveragePercentage - 100) < 1e-9) {
      return "Full";
    } else if (coveragePercentage > 0) {
      return "Partial";
    } else {
      return "No";
    }
  } catch (error) {
    logger.error("Error calculating intersection percent", error);
    return "No";
  }
}

/**
 * Get bounding box [minX, minY, maxX, maxY] from a feature
 */
function getBbox(feat: any): [number, number, number, number] {
  const coords = flattenCoords(feat.geometry);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const [x, y] of coords) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return [minX, minY, maxX, maxY];
}

/**
 * Check if two bounding boxes intersect
 */
function bboxIntersect(
  bbox1: [number, number, number, number],
  bbox2: [number, number, number, number]
): boolean {
  return !(
    bbox1[2] < bbox2[0] ||
    bbox1[0] > bbox2[2] ||
    bbox1[3] < bbox2[1] ||
    bbox1[1] > bbox2[3]
  );
}

/**
 * Flatten all coordinates from a geometry
 */
function flattenCoords(geom: any): Array<[number, number]> {
  const coords: Array<[number, number]> = [];

  function traverse(obj: any): void {
    if (Array.isArray(obj)) {
      if (typeof obj[0] === "number") {
        coords.push([obj[0], obj[1]]);
      } else {
        for (const item of obj) traverse(item);
      }
    }
  }

  traverse(geom.coordinates);
  return coords;
}

/**
 * Select best quality overlays to cover a site
 *
 * ALGORITHM:
 * 1. Sort overlays by resolution (ascending = lower resolution = better quality)
 * 2. Iteratively select overlays with best resolution
 * 3. For each selected overlay, remove its covered geometry from remaining site
 * 4. Continue until site is 100% covered or all overlays exhausted
 * 5. Return only the selected best overlays
 *
 * OPTIMIZATION:
 * - Early bbox filtering to skip non-intersecting overlays
 * - Early exit when site is fully covered
 * - Minimal geometry operations (only intersect/difference)
 * - Cache parsed geometries to avoid re-parsing
 */
export function filterOverlaysByIntersection(
  site: Site,
  overlays: ElasticProviderOverlay[]
): ElasticProviderOverlay[] {
  try {
    if (!site.geometry || overlays.length === 0) {
      return [];
    }

    // Parse site geometry from WKT
    const siteGeom = wkt.parse(site.geometry as any);
    if (!siteGeom) {
      logger.warn("Failed to parse site geometry for filtering", {
        geometry: site.geometry,
      });
      return [];
    }

    let remainingSiteGeom: any = siteGeom;
    const siteFeat = feature(siteGeom as any);
    const siteArea = area(siteFeat as any);

    if (siteArea === 0) {
      logger.warn("Site area is zero", { site: site.site_id });
      return [];
    }

    const siteBbox = getBbox(siteFeat);

    // Parse and cache overlays with valid geometries, filtered by bbox
    const candidateOverlays = overlays
      .map((overlay) => {
        try {
          const overlayGeom = wkt.parse((overlay.geo?.wkt || "") as any);
          if (!overlayGeom) return null;
          const overlayBbox = getBbox(feature(overlayGeom as any));

          // Skip overlays that don't intersect site bbox
          if (!bboxIntersect(siteBbox, overlayBbox)) return null;

          return {
            overlay,
            geometry: overlayGeom,
            resolution: overlay.properties_List?.Resolution ?? Infinity,
          };
        } catch {
          return null;
        }
      })
      .filter((item) => item !== null) as Array<{
      overlay: ElasticProviderOverlay;
      geometry: any;
      resolution: number;
    }>;

    if (candidateOverlays.length === 0) {
      return [];
    }

    // Sort by resolution (ascending = best first, lowest resolution)
    candidateOverlays.sort((a, b) => a.resolution - b.resolution);

    const selectedOverlays: ElasticProviderOverlay[] = [];
    let remainingArea = siteArea;

    // Iteratively select best overlays, removing covered geometry
    for (const candidate of candidateOverlays) {
      try {
        const overlayFeat = feature(candidate.geometry as any);
        const remainingSiteFeat = feature(remainingSiteGeom as any);

        // Check intersection
        const intersection = intersect(
          remainingSiteFeat as any,
          overlayFeat as any
        );

        if (!intersection) {
          continue; // Skip if no intersection
        }

        // Add this overlay to selected list
        selectedOverlays.push(candidate.overlay);
        const intersectionArea = area(intersection as any);
        remainingArea -= intersectionArea;

        logger.debug("Selected overlay for site coverage", {
          siteId: site.site_id,
          resolution: candidate.resolution,
          intersectionArea: intersectionArea.toFixed(2),
          remainingArea: remainingArea.toFixed(2),
          remainingPercentage: ((remainingArea / siteArea) * 100).toFixed(2),
        });

        // Early exit: if site is fully covered (within floating point tolerance)
        if (remainingArea / siteArea < 1e-9) {
          logger.debug("Site fully covered, stopping overlay selection", {
            siteId: site.site_id,
            selectedOverlays: selectedOverlays.length,
          });
          return selectedOverlays;
        }

        // Remove covered area from remaining site geometry
        try {
          // Skip geometry update for point geometries
          if (overlayFeat.geometry.type !== "Point") {
            const diffResult = difference(
              featureCollection([remainingSiteFeat as any, overlayFeat as any])
            );
            if (diffResult && diffResult.geometry) {
              remainingSiteGeom = diffResult.geometry;
            }
          }
        } catch (e) {
          logger.warn(
            "Failed to compute difference, continuing with current geometry",
            { error: e }
          );
          // Continue with current geometry if difference fails
        }
      } catch (e) {
        logger.warn("Failed to process overlay during selection", {
          overlay: candidate.overlay,
          error: e,
        });
        continue;
      }
    }

    const finalCoverage = ((siteArea - remainingArea) / siteArea) * 100;
    logger.debug("Overlay selection complete", {
      siteId: site.site_id,
      selectedOverlays: selectedOverlays.length,
      coverage: finalCoverage.toFixed(2) + "%",
    });

    return selectedOverlays;
  } catch (error) {
    logger.error("Error filtering overlays by intersection", error);
    return [];
  }
}
/**
 * Generate project link URL using configured format
 * Extracts overlay entity IDs and substitutes them into the PROJECT_LINK_FORMAT
 */
export function createProjectLink(
  site: Site,
  overlays: ElasticProviderOverlay[]
): string {
  try {
    if (overlays.length === 0) {
      // Return format string without any overlay IDs
      return PROJECT_LINK_FORMAT.replace("{overlayIds}", "");
    }

    // Extract overlay entity IDs
    const overlayIds = overlays
      .map((o) => `\\\\\\${o.exclusive_id.entity_id}\\\\\\`)
      .join(",");

    // Substitute overlayIds into the format string
    return PROJECT_LINK_FORMAT.replace("{overlayIds}", overlayIds);
  } catch (error) {
    logger.error("Error creating project link", error);
    return "";
  }
}

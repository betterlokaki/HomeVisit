/**
 * Site Data Enrichment Utilities
 *
 * Adds calculated fields to site data.
 */

import { union, intersect, area, feature, featureCollection } from "@turf/turf";
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
        unionedOverlay = union(unionedOverlay, overlayFeats[i]);

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
    const siteFeat = feature(siteGeom as any);

    // Filter overlays based on intersection
    return overlays.filter((overlay: any) => {
      try {
        const overlayGeom = wkt.parse((overlay.geo?.wkt || "") as any);
        if (!overlayGeom) return false;

        const overlayFeat = feature(overlayGeom as any);

        // Check if the overlay intersects with the site
        const intersection = intersect(siteFeat as any, overlayFeat as any);

        return intersection !== null && intersection !== undefined;
      } catch (e) {
        logger.warn("Failed to check overlay intersection with site", {
          overlay,
          error: e,
        });
        return false;
      }
    });
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

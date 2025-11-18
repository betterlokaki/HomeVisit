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

    // Parse site geometry from WKT
    const siteGeom = wkt.parse(site.geometry as any);
    if (!siteGeom) {
      logger.warn("Failed to parse site geometry", { geometry: site.geometry });
      return "No";
    }
    const siteFeat = feature(siteGeom);

    // Parse and union all overlay geometries
    const overlayFeats = overlays
      .map((overlay: any) => {
        try {
          const geom = wkt.parse((overlay.geo?.wkt || "") as any);
          if (!geom) return null;
          return feature(geom);
        } catch (e) {
          logger.warn("Failed to parse overlay geometry", { overlay });
          return null;
        }
      })
      .filter((f) => f !== null);

    if (overlayFeats.length === 0) {
      logger.debug("No valid overlay geometries");
      return "No";
    }

    // Perform unary union of all overlays
    let unionedOverlay: any = overlayFeats[0];
    for (let i = 1; i < overlayFeats.length; i++) {
      try {
        // Union requires FeatureCollections
        const fc1 = featureCollection([unionedOverlay]);
        const fc2 = featureCollection([overlayFeats[i]]);
        unionedOverlay = union(fc1 as any, fc2 as any);
        if (!unionedOverlay) {
          logger.warn("Union resulted in null");
          continue;
        }
      } catch (e) {
        logger.warn("Failed to union overlay geometries", { error: e });
        continue;
      }
    }

    if (!unionedOverlay) {
      logger.debug("No valid unioned overlay");
      return "No";
    }

    // Calculate intersection between site and unioned overlays
    let intersection: any;
    try {
      const siteFc = featureCollection([siteFeat as any]);
      const overlayFc = featureCollection([unionedOverlay as any]);
      intersection = intersect(siteFc as any, overlayFc as any);
    } catch (e) {
      logger.warn("Failed to calculate intersection", { error: e });
      return "No";
    }

    if (!intersection) {
      logger.debug("No intersection found between site and overlays");
      return "No";
    }

    // Calculate areas
    const siteArea = area(siteFeat);
    const intersectionArea = area(intersection);

    if (siteArea === 0) {
      logger.warn("Site area is zero", { site: site.site_id });
      return "No";
    }

    // Calculate percentage coverage
    const coveragePercentage = (intersectionArea / siteArea) * 100;

    logger.debug("Calculated coverage percentage", {
      siteId: site.site_id,
      siteArea,
      intersectionArea,
      coveragePercentage: coveragePercentage.toFixed(2),
    });

    // Determine status based on coverage
    if (coveragePercentage === 100) {
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
 * Filter overlays that intersect with a specific site
 * Returns only the overlays whose geometry intersects with the site geometry
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
    const siteFeat = feature(siteGeom);

    // Filter overlays based on intersection
    return overlays.filter((overlay: any) => {
      try {
        const overlayGeom = wkt.parse((overlay.geo?.wkt || "") as any);
        if (!overlayGeom) return false;

        const overlayFeat = feature(overlayGeom);

        // Check if the overlay intersects with the site
        const siteFc = featureCollection([siteFeat as any]);
        const overlayFc = featureCollection([overlayFeat as any]);
        const intersection = intersect(siteFc as any, overlayFc as any);

        return intersection !== null;
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
    return overlays; // Return all overlays on error to be safe
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
    const overlayIds = overlays.map((o) => o.exclusive_id.entity_id).join(",");

    // Substitute overlayIds into the format string
    return PROJECT_LINK_FORMAT.replace("{overlayIds}", overlayIds);
  } catch (error) {
    logger.error("Error creating project link", error);
    return "";
  }
}

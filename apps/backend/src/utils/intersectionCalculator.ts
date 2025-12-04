/**
 * Intersection Status Calculator - Calculate coverage status between site and overlays
 */
import { union, intersect, area, feature, featureCollection } from "@turf/turf";
import wkt from "wellknown";
import type { Site, UpdatedStatus as SnapshotStatus } from "@homevisit/common";
import type { ElasticProviderOverlay } from "@homevisit/common/src/index.ts";
import { logger } from "../middleware/logger.ts";
import { getBbox, bboxIntersect } from "./geometryBounds.ts";

export async function calculateIntersectionPercent(
  site: Site,
  overlays: ElasticProviderOverlay[]
): Promise<SnapshotStatus> {
  try {
    if (!site.geometry || overlays.length === 0) return "No";

    const siteGeom =
      typeof site.geometry === "string"
        ? wkt.parse(site.geometry)
        : site.geometry;
    if (!siteGeom) return "No";

    const siteFeat = feature(siteGeom as any);
    const siteArea = area(siteFeat as any);
    if (siteArea === 0) return "No";

    const candidates = filterCandidateOverlays(siteFeat, overlays);
    if (candidates.length === 0) return "No";

    const overlayFeats = parseOverlayFeatures(candidates);
    if (overlayFeats.length === 0) return "No";

    const unionedOverlay = computeUnion(
      overlayFeats,
      siteFeat,
      siteArea,
      site.site_id
    );
    if (!unionedOverlay) return "No";

    return calculateCoverage(siteFeat, unionedOverlay, siteArea);
  } catch (error) {
    logger.error("Error calculating intersection percent", error);
    return "No";
  }
}

function filterCandidateOverlays(
  siteFeat: any,
  overlays: ElasticProviderOverlay[]
): ElasticProviderOverlay[] {
  const siteBbox = getBbox(siteFeat);
  return overlays.filter((overlay) => {
    try {
      const geom = wkt.parse((overlay.geo?.wkt || "") as any);
      if (!geom) return false;
      return bboxIntersect(siteBbox, getBbox(feature(geom as any)));
    } catch {
      return false;
    }
  });
}

function parseOverlayFeatures(overlays: ElasticProviderOverlay[]): any[] {
  return overlays
    .map((o) => {
      try {
        const geom = wkt.parse((o.geo?.wkt || "") as any);
        return geom ? feature(geom as any) : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function computeUnion(
  overlayFeats: any[],
  siteFeat: any,
  siteArea: number,
  siteId: number
): any {
  let unioned = overlayFeats[0];
  for (let i = 1; i < overlayFeats.length; i++) {
    try {
      unioned = union(featureCollection([unioned, overlayFeats[i]]));
      const testIntersection = intersect(
        featureCollection([siteFeat, unioned])
      );
      if (
        testIntersection &&
        Math.abs((area(testIntersection as any) / siteArea) * 100 - 100) < 1e-9
      ) {
        logger.debug("Reached 100% coverage early", {
          siteId,
          processed: i + 1,
          total: overlayFeats.length,
        });
        break;
      }
    } catch (e) {
      logger.warn("Failed to union overlay", { error: e });
    }
  }
  return unioned;
}

function calculateCoverage(
  siteFeat: any,
  unionedOverlay: any,
  siteArea: number
): SnapshotStatus {
  try {
    const p = intersect(featureCollection([siteFeat, unionedOverlay]));
    if (!p) return "No";
    const pct = (area(p as any) / siteArea) * 100;
    return Math.abs(pct - 100) < 1e-9 ? "Full" : pct > 0 ? "Partial" : "No";
  } catch {
    return "No";
  }
}

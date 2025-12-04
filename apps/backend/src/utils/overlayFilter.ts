/**
 * Overlay Filter - Select best quality overlays to cover a site
 */
import {
  intersect,
  area,
  feature,
  featureCollection,
  difference,
} from "@turf/turf";
import wkt from "wellknown";
import type { Site } from "@homevisit/common";
import type { ElasticProviderOverlay } from "@homevisit/common/src/index.ts";
import { logger } from "../middleware/logger.ts";
import { getBbox, bboxIntersect } from "./geometryBounds.ts";

interface OverlayCandidate {
  overlay: ElasticProviderOverlay;
  geometry: any;
  resolution: number;
}

export function filterOverlaysByIntersection(
  site: Site,
  overlays: ElasticProviderOverlay[]
): ElasticProviderOverlay[] {
  try {
    if (!site.geometry || overlays.length === 0) return [];

    const siteGeom = wkt.parse(site.geometry as any);
    if (!siteGeom) return [];

    const siteFeat = feature(siteGeom as any);
    const siteArea = area(siteFeat as any);
    if (siteArea === 0) return [];

    const candidates = getCandidates(siteFeat, overlays);
    return candidates.length === 0
      ? []
      : selectBest(candidates, siteGeom, siteArea, site.site_id);
  } catch (error) {
    logger.error("Error filtering overlays", error);
    return [];
  }
}

function getCandidates(
  siteFeat: any,
  overlays: ElasticProviderOverlay[]
): OverlayCandidate[] {
  const siteBbox = getBbox(siteFeat);
  return overlays
    .map((overlay) => {
      try {
        const geom = wkt.parse((overlay.geo?.wkt || "") as any);
        if (!geom || !bboxIntersect(siteBbox, getBbox(feature(geom as any))))
          return null;
        return {
          overlay,
          geometry: geom,
          resolution: overlay.properties_List?.Resolution ?? Infinity,
        };
      } catch {
        return null;
      }
    })
    .filter((item): item is OverlayCandidate => item !== null)
    .sort((a, b) => a.resolution - b.resolution);
}

function selectBest(
  candidates: OverlayCandidate[],
  siteGeom: any,
  siteArea: number,
  siteId: number
): ElasticProviderOverlay[] {
  const selected: ElasticProviderOverlay[] = [];
  let remainingGeom: any = siteGeom;
  let remainingArea = siteArea;

  for (const c of candidates) {
    try {
      const overlayFeat = feature(c.geometry as any);
      const remainingFeat = feature(remainingGeom as any);
      const inter = intersect(featureCollection([remainingFeat, overlayFeat]));
      if (!inter) continue;

      selected.push(c.overlay);
      remainingArea -= area(inter as any);

      if (remainingArea / siteArea < 1e-9) {
        logger.debug("Site fully covered", {
          siteId,
          overlays: selected.length,
        });
        return selected;
      }

      remainingGeom = updateRemaining(
        remainingFeat,
        overlayFeat,
        remainingGeom
      );
    } catch (e) {
      logger.warn("Failed to process overlay", { error: e });
    }
  }

  logger.debug("Overlay selection complete", {
    siteId,
    overlays: selected.length,
    coverage: (((siteArea - remainingArea) / siteArea) * 100).toFixed(2) + "%",
  });
  return selected;
}

function updateRemaining(
  remainingFeat: any,
  overlayFeat: any,
  current: any
): any {
  try {
    if (overlayFeat.geometry.type !== "Point") {
      const diff = difference(featureCollection([remainingFeat, overlayFeat]));
      if (diff?.geometry) return diff.geometry;
    }
  } catch {}
  return current;
}

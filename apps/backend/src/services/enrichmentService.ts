import type { Site } from "@homevisit/common";
import { PostgRESTClient } from "./postgrestClient.js";
import { fetchOverlays } from "./overlayService.js";
import { calcaulteIntersectionPrecent } from "../utils/siteEnricher.js";
import { createProjectLink } from "../utils/siteEnricher.js";
import { mergeGeometriesToMultiPolygon } from "../utils/geometryMerger.js";
import { logger } from "../middleware/logger.js";

export class EnrichmentService {
  constructor(private postgrest: PostgRESTClient) {}

  async enrichSites(sites: Site[], group: any): Promise<any[]> {
    if (sites.length === 0) return [];
    const geometries = sites.map((s) => s.geometry) as string[];
    const wkt = mergeGeometriesToMultiPolygon(geometries);
    const endDate = new Date();
    const startDate = new Date(
      endDate.getTime() - (group?.data_refreshments || 0) * 1000
    );
    const overlays = await fetchOverlays(wkt, startDate, endDate);
    return Promise.all(
      sites.map(async (site) => ({
        ...site,
        updatedStatus: await calcaulteIntersectionPrecent(site, overlays),
        siteLink: createProjectLink(site, overlays),
      }))
    );
  }
}

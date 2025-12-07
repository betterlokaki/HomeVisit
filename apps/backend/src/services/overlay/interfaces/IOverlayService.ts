import type { ElasticProviderOverlay } from "@homevisit/common";

/**
 * Service for fetching overlays from external elastic provider
 */
export interface IOverlayService {
  fetchOverlays(
    wkt: string,
    start: Date,
    end: Date
  ): Promise<ElasticProviderOverlay[]>;
}

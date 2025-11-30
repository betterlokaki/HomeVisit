/**
 * Enrichment Service Response Types
 * Response has a dynamic key containing array of site status items
 */

import type { UpdatedStatus } from "./Site.js";

export interface EnrichmentSiteStatusItem {
  siteName: string;
  status: UpdatedStatus;
  projectLink: string;
}

/**
 * The response body from the enrichment service.
 * The outer key is dynamic (random), containing an array of site status items.
 */
export type EnrichmentResponseBody = Record<string, EnrichmentSiteStatusItem[]>;

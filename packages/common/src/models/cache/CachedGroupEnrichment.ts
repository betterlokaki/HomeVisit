/**
 * Cached enrichment data for a group
 * Map key is siteName, value is the enrichment data
 */

import type { CachedSiteEnrichmentItem } from "./CachedSiteEnrichmentItem.js";

export interface CachedGroupEnrichment {
  siteEnrichments: Map<string, CachedSiteEnrichmentItem>;
  lastUpdated: Date;
}

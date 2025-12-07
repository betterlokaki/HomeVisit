/**
 * Enrichment response body - response from the enrichment service
 * The outer key is dynamic, containing an array of site status items
 */

import type { EnrichmentSiteStatusItem } from "./EnrichmentSiteStatusItem.js";

export type EnrichmentResponseBody = Record<string, EnrichmentSiteStatusItem[]>;

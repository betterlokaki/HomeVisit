/**
 * Enrichment Service configuration
 */

import type { RequestKeys } from "./RequestKeys.ts";

export interface EnrichmentServiceConfig {
  url: string;
  headers: Record<string, string>;
  requestKeys: RequestKeys;
  cacheRefreshIntervalMinutes: number;
}

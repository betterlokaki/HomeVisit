/**
 * Enrichment request body - sent to the enrichment service
 * Uses dynamic keys for dataKey and dateKey
 */

import type { EnrichmentDataItem } from "./EnrichmentDataItem.js";
import type { EnrichmentDateItem } from "./EnrichmentDateItem.js";

export type EnrichmentRequestBody = Record<
  string,
  EnrichmentDataItem | EnrichmentDateItem
>;

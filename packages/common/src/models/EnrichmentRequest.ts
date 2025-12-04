/**
 * Enrichment Service Request Types
 * Request structure uses dynamic keys but follows a specific pattern:
 * - dataKey: geometries (WKTs) in { text: string[], text_id: string[] }
 * - dateKey: date range in { StartTime: { From: string, To: string } }
 */

export interface EnrichmentDataItem {
  text: string[];
  text_id: string[];
}

export interface EnrichmentDateRange {
  From: string;
  To: string;
}

export interface EnrichmentDateItem {
  StartTime: EnrichmentDateRange;
}

/**
 * The request body sent to the enrichment service.
 * Uses dynamic keys for dataKey and dateKey.
 */
export type EnrichmentRequestBody = Record<
  string,
  EnrichmentDataItem | EnrichmentDateItem
>;

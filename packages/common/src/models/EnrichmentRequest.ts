/**
 * Enrichment Service Request Types
 * Request structure uses dynamic keys but follows a specific pattern:
 * - Item 0: geometries (WKTs) in { texts: string[] }
 * - Item 1: site names in { texts: string[] }
 * - Item 2: date range in { StartTime: { DateFrom: string, DateTo: string } }
 */

export interface EnrichmentGeometryItem {
  texts: string[];
}

export interface EnrichmentSiteNamesItem {
  texts: string[];
}

export interface EnrichmentDateRange {
  DateFrom: string;
  DateTo: string;
}

export interface EnrichmentDateItem {
  StartTime: EnrichmentDateRange;
}

/**
 * The request body sent to the enrichment service.
 * The outer key is dynamic (random), containing an array of 3 items.
 */
export type EnrichmentRequestBody = Record<
  string,
  [
    Record<string, EnrichmentGeometryItem>,
    Record<string, EnrichmentSiteNamesItem>,
    Record<string, EnrichmentDateItem>
  ]
>;

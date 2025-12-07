import type {
  EnrichmentRequestBody,
  EnrichmentSiteStatusItem,
} from "@homevisit/common";
import { getEnrichmentConfig } from "../../config/enrichmentConfig.ts";

interface EnrichmentRequestKeys {
  dataKey: string;
  dateKey: string;
}

/**
 * Builds the enrichment request body with configured keys
 */
export function buildEnrichmentRequest(
  siteNames: string[],
  geometries: string[],
  dateFrom: string,
  dateTo: string,
  requestKeys: EnrichmentRequestKeys
): EnrichmentRequestBody {
  const { dataKey, dateKey } = requestKeys;
  return {
    [dataKey]: { text: geometries, text_id: siteNames },
    [dateKey]: { StartTime: { From: dateFrom, To: dateTo } },
  };
}

/**
 * Creates a status lookup map from enrichment response items
 */
export function createStatusMap(
  statusItems: EnrichmentSiteStatusItem[]
): Map<string, EnrichmentSiteStatusItem> {
  return new Map(statusItems.map((item) => [item.siteName, item]));
}

/**
 * Gets enrichment config for external service
 */
export function getEnrichmentServiceConfig() {
  const config = getEnrichmentConfig();
  return config.enrichmentService;
}

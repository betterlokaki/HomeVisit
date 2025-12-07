/**
 * Full Enrichment configuration
 */

import type { EnrichmentServiceConfig } from "./EnrichmentServiceConfig.ts";
import type { CoverUpdateServiceConfig } from "./CoverUpdateServiceConfig.ts";

export interface EnrichmentConfig {
  enrichmentService: EnrichmentServiceConfig;
  coverUpdateService: CoverUpdateServiceConfig;
}

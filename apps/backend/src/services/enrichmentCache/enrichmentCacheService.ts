/**
 * Enrichment Cache Service
 * Extends GenericCacheService to store enrichment data per group
 */

import type { CachedGroupEnrichment } from "@homevisit/common";
import type { IEnrichmentCacheService } from "./interfaces/IEnrichmentCacheService.ts";
import { GenericCacheService } from "../cache/GenericCacheService.ts";

export class EnrichmentCacheService
  extends GenericCacheService<CachedGroupEnrichment>
  implements IEnrichmentCacheService
{
  constructor() {
    super("enrichment");
  }
}

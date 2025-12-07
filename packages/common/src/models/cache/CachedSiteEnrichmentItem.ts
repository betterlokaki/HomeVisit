/**
 * Single site enrichment cache item
 */

import type { UpdatedStatus } from "../site/UpdatedStatus.js";

export interface CachedSiteEnrichmentItem {
  status: UpdatedStatus;
  projectLink: string;
}

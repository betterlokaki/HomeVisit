/**
 * Enrichment site status item - individual site status in response
 */

import type { UpdatedStatus } from "../site/UpdatedStatus.js";

export interface EnrichmentSiteStatusItem {
  siteName: string;
  status: UpdatedStatus;
  projectLink: string;
}

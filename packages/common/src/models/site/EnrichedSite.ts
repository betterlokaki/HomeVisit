/**
 * Enriched site with backend-calculated fields
 */

import type { Site } from "./Site.js";
import type { UpdatedStatus } from "./UpdatedStatus.js";

export interface EnrichedSite extends Site {
  updatedStatus: UpdatedStatus;
  siteLink: string;
}

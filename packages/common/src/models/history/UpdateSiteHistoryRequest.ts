/**
 * Update site history request
 */

import type { SeenStatus } from "../site/SeenStatus.js";

export interface UpdateSiteHistoryRequest {
  status: SeenStatus;
}

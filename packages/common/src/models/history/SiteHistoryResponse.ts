/**
 * Site history response
 */

import type { SiteHistory } from "./SiteHistory.js";

export interface SiteHistoryResponse {
  success: boolean;
  data: SiteHistory[];
}

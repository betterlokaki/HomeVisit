/**
 * Site History model - Represents historical visit status records
 */

import type { SeenStatus } from "./Site.js";

export interface SiteHistory {
  history_id: number;
  site_id: number;
  site_name: string;
  status: SeenStatus;
  recorded_date: Date;
}

export interface SiteHistoryResponse {
  success: boolean;
  data: SiteHistory[];
}

export interface UpdateSiteHistoryRequest {
  status: SeenStatus;
}

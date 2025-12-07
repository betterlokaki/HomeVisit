/**
 * Site history record
 */

import type { SeenStatus } from "../site/SeenStatus.js";

export interface SiteHistory {
  history_id: number;
  site_id: number;
  site_name: string;
  status: SeenStatus;
  recorded_date: Date;
}

/**
 * Site entity - represents a geographic site to be visited
 */

import type { SeenStatus } from "./SeenStatus.js";

export interface Site {
  site_id: number;
  site_name: string;
  group_id: number;
  username: string;
  display_name: string;
  seen_status: SeenStatus;
  seen_date: Date;
  geometry: string; // WKT (Well-Known Text) format
}

/**
 * Merged History Entry - Single entry combining cover status and visit status
 */

import type { UpdatedStatus, SeenStatus } from "./Site.js";
import type { MergedStatus } from "./MergedStatus.js";

export interface MergedHistoryEntry {
  date: string;
  coverStatus: UpdatedStatus;
  visitStatus: SeenStatus;
  mergedStatus: MergedStatus;
}

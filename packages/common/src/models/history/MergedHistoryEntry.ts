/**
 * Merged History Entry - Single entry combining cover status and visit status
 */

import type { UpdatedStatus } from "../site/UpdatedStatus.js";
import type { SeenStatus } from "../site/SeenStatus.js";
import type { MergedStatus } from "./MergedStatus.js";

export interface MergedHistoryEntry {
  date: string;
  coverStatus: UpdatedStatus;
  visitStatus: SeenStatus;
  mergedStatus: MergedStatus;
}

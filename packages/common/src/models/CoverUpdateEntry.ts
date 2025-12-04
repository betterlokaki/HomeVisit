/**
 * Cover Update Entry - Single entry from cover update external service
 */

import type { UpdatedStatus } from "./Site.js";

export interface CoverUpdateEntry {
  date: string;
  status: UpdatedStatus;
}

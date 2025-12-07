/**
 * Cover Update Entry - Single entry from cover update external service
 */

import type { UpdatedStatus } from "../site/UpdatedStatus.js";

export interface CoverUpdateEntry {
  date: string;
  status: UpdatedStatus;
}

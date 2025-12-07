/**
 * Cover Update Response - Response from cover update external service
 */

import type { CoverUpdateEntry } from "./CoverUpdateEntry.js";

export interface CoverUpdateResponse {
  [key: string]: CoverUpdateEntry[];
}

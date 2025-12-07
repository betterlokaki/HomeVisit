/**
 * Merged History Response - Final response with merged history data
 */

import type { MergedHistoryEntry } from "./MergedHistoryEntry.js";

export interface MergedHistoryResponse {
  siteId: number;
  siteName: string;
  history: MergedHistoryEntry[];
}

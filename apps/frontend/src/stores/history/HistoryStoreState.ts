/**
 * History Store State - internal state of the history store
 */

import type { MergedHistoryEntry } from "@homevisit/common";

export interface HistoryStoreState {
  // Map of siteId -> Map of date (YYYY-MM-DD) -> MergedHistoryEntry
  historyData: Map<number, Map<string, MergedHistoryEntry>>;
  selectedDate: string | null; // YYYY-MM-DD format, null means today
  loading: boolean;
  error: string | null;
}

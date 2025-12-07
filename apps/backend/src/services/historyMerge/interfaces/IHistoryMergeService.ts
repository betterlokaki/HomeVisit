/**
 * Interface for History Merge Service
 */

import type {
  CoverUpdateEntry,
  MergedHistoryEntry,
  SiteHistory,
} from "@homevisit/common";

export interface IHistoryMergeService {
  mergeHistory(
    coverUpdates: CoverUpdateEntry[],
    visitHistory: SiteHistory[]
  ): MergedHistoryEntry[];
}

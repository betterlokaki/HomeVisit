/**
 * History Merge Service - Merges cover update statuses with visit history
 */

import type {
  CoverUpdateEntry,
  MergedHistoryEntry,
  SiteHistory,
  SeenStatus,
} from "@homevisit/common";
import type { IHistoryMergeService } from "./interfaces/IHistoryMergeService.ts";
import { getMergedStatus } from "./mergedStatusCalculator.ts";
import { toDateKey } from "./dateKeyHelper.ts";

export class HistoryMergeService implements IHistoryMergeService {
  mergeHistory(
    coverUpdates: CoverUpdateEntry[],
    visitHistory: SiteHistory[]
  ): MergedHistoryEntry[] {
    const visitMap = new Map<string, SeenStatus>();
    for (const visit of visitHistory) {
      visitMap.set(toDateKey(visit.recorded_date), visit.status);
    }

    const mergedHistory: MergedHistoryEntry[] = coverUpdates.map((update) => {
      const dateKey = toDateKey(update.date);
      const visitStatus: SeenStatus = visitMap.get(dateKey) || "Not Seen";
      return {
        date: update.date,
        coverStatus: update.status,
        visitStatus,
        mergedStatus: getMergedStatus(update.status, visitStatus),
      };
    });

    return mergedHistory.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
}

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

    // Build visit map - if multiple entries for same date, use the LATEST one (highest history_id)
    // Sort by recorded_date DESC then by history_id DESC to get most recent
    const sortedVisitHistory = [...visitHistory].sort((a, b) => {
      const dateA = new Date(a.recorded_date).getTime();
      const dateB = new Date(b.recorded_date).getTime();
      if (dateA !== dateB) return dateB - dateA; // Newest first
      // If same date, use history_id (assuming higher ID = newer)
      const idA = (a as any).history_id || 0;
      const idB = (b as any).history_id || 0;
      return idB - idA;
    });

    for (const visit of sortedVisitHistory) {
      const key = toDateKey(visit.recorded_date);
      // Only set if not already set (first one wins, which is the newest due to sort)
      if (!visitMap.has(key)) {
        visitMap.set(key, visit.status);
      }
    }

    const mergedHistory: MergedHistoryEntry[] = coverUpdates.map((update) => {
      const dateKey = toDateKey(update.date);
      const visitStatus: SeenStatus = visitMap.get(dateKey) || "Not Seen";

      const finalVisitStatus = visitMap.get(dateKey) || "Not Seen";
      const finalMergedStatus = getMergedStatus(
        update.status,
        finalVisitStatus
      );

      return {
        date: update.date,
        coverStatus: update.status,
        visitStatus: finalVisitStatus,
        mergedStatus: finalMergedStatus,
      };
    });

    return mergedHistory.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }
}

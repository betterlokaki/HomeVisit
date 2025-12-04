/**
 * History Merge Service - Merges cover update statuses with visit history
 *
 * Merge Rules (5 possible merged statuses):
 * - Seen → Site Seen + Full Cover
 * - Partial Cover → Site Not Seen + Partial Cover
 * - Partial Seen → Site Partial + Partial Cover
 * - Not Seen → Site Not Seen + (Partial Cover OR Full Cover)
 * - Not Cover → Site Not Seen + No Cover
 *
 * Note: Site cannot be Seen if No Cover
 */

import type {
  CoverUpdateEntry,
  UpdatedStatus,
  MergedHistoryEntry,
  SiteHistory,
  SeenStatus,
  MergedStatus,
} from "@homevisit/common";
import type { IHistoryMergeService } from "../interfaces/IHistoryMergeService.ts";

export class HistoryMergeService implements IHistoryMergeService {
  /**
   * Get merged status based on cover status and visit status
   */
  private getMergedStatus(
    coverStatus: UpdatedStatus,
    visitStatus: SeenStatus
  ): MergedStatus {
    // No Cover → Not Cover (site cannot be seen without cover)
    if (coverStatus === "No") {
      return "Not Cover";
    }

    // Full Cover cases
    if (coverStatus === "Full") {
      if (visitStatus === "Seen") {
        return "Seen";
      }
      // Not Seen or Partial with Full Cover → Not Seen
      return "Not Seen";
    }

    // Partial Cover cases
    if (coverStatus === "Partial") {
      if (visitStatus === "Partial") {
        return "Partial Seen";
      }
      if (visitStatus === "Not Seen") {
        return "Partial Cover";
      }
      // Seen with Partial Cover shouldn't happen, but treat as Not Seen
      return "Not Seen";
    }

    // Default fallback
    return "Not Cover";
  }

  /**
   * Convert date to YYYY-MM-DD format for comparison
   */
  private toDateKey(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toISOString().split("T")[0];
  }

  /**
   * Merge cover updates with visit history
   */
  mergeHistory(
    coverUpdates: CoverUpdateEntry[],
    visitHistory: SiteHistory[]
  ): MergedHistoryEntry[] {
    // Create a map of visit history by date
    const visitMap = new Map<string, SeenStatus>();
    for (const visit of visitHistory) {
      const dateKey = this.toDateKey(visit.recorded_date);
      visitMap.set(dateKey, visit.status);
    }

    // Merge cover updates with visit history
    const mergedHistory: MergedHistoryEntry[] = [];

    for (const coverUpdate of coverUpdates) {
      const dateKey = this.toDateKey(coverUpdate.date);
      const visitStatus: SeenStatus = visitMap.get(dateKey) || "Not Seen";
      const mergedStatus = this.getMergedStatus(
        coverUpdate.status,
        visitStatus
      );

      mergedHistory.push({
        date: coverUpdate.date,
        coverStatus: coverUpdate.status,
        visitStatus: visitStatus,
        mergedStatus,
      });
    }

    // Sort by date ascending
    mergedHistory.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return mergedHistory;
  }
}

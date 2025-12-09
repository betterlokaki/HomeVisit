/**
 * CSV Summary Builder
 * Single Responsibility: Build CSV data structure from sites and history data
 */

import dayjs from "dayjs";
import type { VisitCard } from "../stores/visit/VisitCard";
import type { MergedHistoryResponse } from "@homevisit/common";

/**
 * Generate date range from 30 days ago to today
 * @returns Array of date strings in YYYY-MM-DD format
 */
function generateDateRange(): string[] {
  const dates: string[] = [];
  const today = dayjs();

  for (let i = 30; i >= 0; i--) {
    const date = today.subtract(i, "day");
    dates.push(date.format("YYYY-MM-DD"));
  }

  return dates;
}

/**
 * Format date to localized format (DD/MM/YYYY)
 */
function formatLocalizedDate(dateString: string): string {
  return dayjs(dateString).format("DD/MM/YYYY");
}

/**
 * Translate merged status to Hebrew
 * @param mergedStatus English merged status
 * @returns Hebrew translation
 */
function translateMergedStatus(mergedStatus: string): string {
  const translations: Record<string, string> = {
    "Not Cover": "אין כיסוי",
    "Partial Seen": "בוקר חלקית",
    Seen: "בוקר",
    "Not Seen": "מחכה לביקור",
    "Partial Cover": "מחכה לביקור",
  };

  return translations[mergedStatus] || mergedStatus;
}

/**
 * Build CSV summary data structure
 * @param sites Array of all sites
 * @param historyMap Map of siteId -> MergedHistoryResponse
 * @returns Array of objects ready for CSV conversion
 */
export function buildCsvSummaryData(
  sites: VisitCard[],
  historyMap: Map<number, MergedHistoryResponse>
): Record<string, string>[] {
  const dateRange = generateDateRange();

  // Build CSV rows
  const rows: Record<string, string>[] = sites.map((site) => {
    const row: Record<string, string> = {
      site: site.site_name || "",
    };

    // Get history for this site
    const history = historyMap.get(site.site_id);
    const historyByDate = new Map<string, string>();

    if (history && history.history) {
      for (const entry of history.history) {
        // Normalize date to YYYY-MM-DD format for matching
        const normalizedDate = dayjs(entry.date).format("YYYY-MM-DD");
        const translatedStatus = entry.mergedStatus
          ? translateMergedStatus(entry.mergedStatus)
          : "אין מידע";
        historyByDate.set(normalizedDate, translatedStatus);
      }
    }

    // Add merged status for each date
    for (const date of dateRange) {
      const localizedDate = formatLocalizedDate(date);
      const mergedStatus = historyByDate.get(date) || "אין מידע";
      row[localizedDate] = mergedStatus;
    }

    return row;
  });

  return rows;
}

/**
 * Generate filename with date range
 * @returns Filename string
 */
export function generateCsvFilename(): string {
  const today = dayjs();
  const thirtyDaysAgo = today.subtract(30, "day");

  const startDate = thirtyDaysAgo.format("DD-MM-YYYY");
  const endDate = today.format("DD-MM-YYYY");

  return `site_status_${startDate}_to_${endDate}.csv`;
}

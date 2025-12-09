/**
 * History Map Builder
 * Single Responsibility: Build date-to-entry map from history array
 */

import dayjs from "dayjs";
import type { MergedHistoryEntry } from "@homevisit/common";

export function buildHistoryMap(
  history: MergedHistoryEntry[]
): Map<string, MergedHistoryEntry> {
  const map = new Map<string, MergedHistoryEntry>();
  history.forEach((entry) => {
    const dateKey = dayjs(entry.date).format("YYYY-MM-DD");
    map.set(dateKey, entry);
  });
  return map;
}

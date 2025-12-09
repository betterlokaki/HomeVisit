/**
 * History Filter
 * Single Responsibility: Filter cards based on historical data when viewing history
 */

import type { VisitCard } from "../stores/visit/VisitCard";
import type { SiteFilters } from "../stores/visit/SiteFilters";
import { historyStore } from "../stores/history";
import dayjs from "dayjs";

/**
 * Check if a card matches the filters based on historical data
 * Filters are OR'd together - if any filter matches, show the card
 */
function matchesHistoryFilter(
  card: VisitCard,
  filters: SiteFilters,
  date: string
): boolean {
  // Get historical entry for this date
  const historyEntry = historyStore.getSiteHistoryEntry(card.site_id, date);

  // If no history entry, use current card data
  const coverStatus = historyEntry?.coverStatus || card.updatedStatus;
  const seenStatus = historyEntry?.visitStatus || card.seen_status;

  // Filter by selected users (this is always applied)
  if (filters.selectedUsers.length > 0) {
    const cardUsername = (card as any).username;
    if (!filters.selectedUsers.includes(cardUsername)) {
      return false;
    }
  }

  // Check if any status filter matches (OR logic)
  let matchesAnyFilter = false;

  // Filter: awaiting (updatedStatus Full|Partial AND seenStatus Not Seen|Partial)
  if (filters.awaiting) {
    const hasCoverage = coverStatus === "Full" || coverStatus === "Partial";
    const notFullySeen = seenStatus === "Not Seen" || seenStatus === "Partial";
    if (hasCoverage && notFullySeen) {
      matchesAnyFilter = true;
    }
  }

  // Filter: collection (updatedStatus = "No")
  if (filters.collection) {
    if (coverStatus === "No") {
      matchesAnyFilter = true;
    }
  }

  // Filter: completedFull (seenStatus = "Seen")
  if (filters.completedFull) {
    if (seenStatus === "Seen") {
      matchesAnyFilter = true;
    }
  }

  // Filter: completedPartial (seenStatus = "Partial")
  if (filters.completedPartial) {
    if (seenStatus === "Partial") {
      matchesAnyFilter = true;
    }
  }

  // If no status filters are active, show all cards (after user filter)
  // If status filters are active, show only cards that match at least one
  const hasStatusFilters =
    filters.awaiting ||
    filters.collection ||
    filters.completedFull ||
    filters.completedPartial;
  return !hasStatusFilters || matchesAnyFilter;
}

/**
 * Filter cards based on current or historical data
 */
export function filterCardsForHistory(
  cards: VisitCard[],
  filters: SiteFilters,
  selectedDate: string | null
): VisitCard[] {
  const today = dayjs().format("YYYY-MM-DD");
  const isViewingHistory = selectedDate !== null && selectedDate !== today;

  // If viewing today, cards are already filtered by backend
  if (!isViewingHistory) {
    return cards;
  }

  // If viewing history, apply client-side filtering based on historical data
  return cards.filter((card) =>
    matchesHistoryFilter(card, filters, selectedDate)
  );
}

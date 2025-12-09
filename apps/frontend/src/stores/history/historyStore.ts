/**
 * History Store
 * Single Responsibility: State management for site history data
 */

import { writable, get } from "svelte/store";
import dayjs from "dayjs";
import type { HistoryStoreState } from "./HistoryStoreState";
import type { MergedHistoryEntry, SeenStatus, MergedStatus, UpdatedStatus } from "@homevisit/common";
import { buildHistoryMap } from "../../components/calendar/historyMapBuilder";
import { updateHistoryStatus as apiUpdateHistoryStatus } from "./historyApiClient";

function createHistoryStore() {
  const initialState: HistoryStoreState = {
    historyData: new Map(),
    selectedDate: null, // null means today
    loading: false,
    error: null,
  };

  const { subscribe, set, update } = writable<HistoryStoreState>(initialState);

  const getState = (): HistoryStoreState => get({ subscribe } as any);

  const storeAPI = {
    subscribe,

    /**
     * Set history data for a site
     */
    setSiteHistory: (siteId: number, history: MergedHistoryEntry[]) => {
      update((state) => {
        const newHistoryData = new Map(state.historyData);
        const historyMap = buildHistoryMap(history);
        newHistoryData.set(siteId, historyMap);
        return { ...state, historyData: newHistoryData };
      });
    },

    /**
     * Get history entry for a site on a specific date
     */
    getSiteHistoryEntry: (
      siteId: number,
      date: string
    ): MergedHistoryEntry | null => {
      const state = getState();
      const siteHistory = state.historyData.get(siteId);
      if (!siteHistory) return null;
      return siteHistory.get(date) || null;
    },

    /**
     * Set the selected date (YYYY-MM-DD format, or null for today)
     */
    setSelectedDate: (date: string | null) => {
      update((state) => ({ ...state, selectedDate: date }));
    },

    /**
     * Get the currently selected date (returns today's date if null)
     */
    getSelectedDate: (): string => {
      const state = getState();
      if (state.selectedDate === null) {
        return dayjs().format("YYYY-MM-DD");
      }
      return state.selectedDate;
    },

    /**
     * Navigate to previous day
     */
    goToPreviousDay: () => {
      const currentDate = storeAPI.getSelectedDate();
      const previousDate = dayjs(currentDate)
        .subtract(1, "day")
        .format("YYYY-MM-DD");
      storeAPI.setSelectedDate(previousDate);
    },

    /**
     * Navigate to next day (can't go beyond today)
     */
    goToNextDay: () => {
      const currentDate = storeAPI.getSelectedDate();
      const today = dayjs().format("YYYY-MM-DD");
      if (currentDate >= today) return; // Can't go forward beyond today
      const nextDate = dayjs(currentDate).add(1, "day").format("YYYY-MM-DD");
      if (nextDate > today) {
        storeAPI.setSelectedDate(null); // Go to today
      } else {
        storeAPI.setSelectedDate(nextDate);
      }
    },

    /**
     * Go to yesterday
     */
    goToYesterday: () => {
      const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      storeAPI.setSelectedDate(yesterday);
    },

    /**
     * Go to today (reset to null)
     */
    goToToday: () => {
      storeAPI.setSelectedDate(null);
    },

    /**
     * Check if we can go forward (not on today)
     */
    canGoForward: (): boolean => {
      const currentDate = storeAPI.getSelectedDate();
      const today = dayjs().format("YYYY-MM-DD");
      return currentDate < today;
    },

    /**
     * Set loading state
     */
    setLoading: (loading: boolean) => {
      update((state) => ({ ...state, loading }));
    },

    /**
     * Set error state
     */
    setError: (error: string | null) => {
      update((state) => ({ ...state, error }));
    },

    /**
     * Clear all history data
     */
    clear: () => {
      set({ ...initialState });
    },

    /**
     * Update history status for a site on a specific date
     */
    updateHistoryStatus: async (
      siteId: number,
      siteName: string,
      groupName: string,
      date: string, // YYYY-MM-DD format
      newStatus: SeenStatus
    ): Promise<void> => {
      try {
        // Call API to update history
        await apiUpdateHistoryStatus(siteName, groupName, date, newStatus);

        // Update local state
        update((state) => {
          const newHistoryData = new Map(state.historyData);
          const siteHistory = newHistoryData.get(siteId);
          
          if (siteHistory) {
            const entry = siteHistory.get(date);
            if (entry) {
              // Update the entry with new visit status and recalculate merged status
              const updatedEntry: MergedHistoryEntry = {
                ...entry,
                visitStatus: newStatus,
                mergedStatus: calculateMergedStatus(entry.coverStatus, newStatus),
              };
              const updatedSiteHistory = new Map(siteHistory);
              updatedSiteHistory.set(date, updatedEntry);
              newHistoryData.set(siteId, updatedSiteHistory);
            }
          }

          return { ...state, historyData: newHistoryData };
        });
      } catch (error) {
        console.error("Failed to update history status:", error);
        update((state) => ({
          ...state,
          error: error instanceof Error ? error.message : "Failed to update history",
        }));
        throw error;
      }
    },
  };

  return storeAPI;
}

/**
 * Calculate merged status from cover status and visit status
 */
function calculateMergedStatus(
  coverStatus: UpdatedStatus,
  visitStatus: SeenStatus
): MergedStatus {
  if (coverStatus === "No") {
    return "Not Cover";
  }

  if (coverStatus === "Full") {
    return visitStatus === "Seen" ? "Seen" : "Not Seen";
  }

  if (coverStatus === "Partial") {
    if (visitStatus === "Partial") return "Partial Seen";
    if (visitStatus === "Not Seen") return "Partial Cover";
    return "Not Seen";
  }

  return "Not Cover";
}

export const historyStore = createHistoryStore();

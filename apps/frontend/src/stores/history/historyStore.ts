/**
 * History Store
 * Single Responsibility: State management for site history data
 */

import { writable, get } from "svelte/store";
import dayjs from "dayjs";
import type { HistoryStoreState } from "./HistoryStoreState";
import type { MergedHistoryEntry, SeenStatus } from "@homevisit/common";
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
      console.log("setSiteHistory called", {
        siteId,
        historyLength: history.length,
      });
      update((state) => {
        const newHistoryData = new Map(state.historyData);
        const historyMap = buildHistoryMap(history);
        newHistoryData.set(siteId, historyMap);
        console.log("setSiteHistory updating store", {
          siteId,
          historyMapSize: historyMap.size,
          newHistoryDataSize: newHistoryData.size,
        });
        return { ...state, historyData: newHistoryData };
      });
      console.log("setSiteHistory completed");
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
     * Status is ONLY updated via backend - we always refetch to get the correct merged status
     */
    updateHistoryStatus: async (
      siteId: number,
      siteName: string,
      groupName: string,
      date: string, // YYYY-MM-DD format
      newStatus: SeenStatus,
      groupId: number // Required groupId for refetching history from backend
    ): Promise<void> => {
      console.log("updateHistoryStatus called", {
        siteId,
        siteName,
        groupName,
        date,
        newStatus,
        groupId,
      });

      try {
        // Call API to update history in backend
        console.log("Calling apiUpdateHistoryStatus...");
        await apiUpdateHistoryStatus(siteName, groupName, date, newStatus);
        console.log("apiUpdateHistoryStatus completed successfully");

        // Always refetch the full history from backend to get the correct merged status
        // The backend calculates merged status correctly based on coverStatus + visitStatus
        // Add a small delay to ensure cache invalidation completes
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("Refetching history from backend with groupId", groupId);
        const { fetchCoverUpdate } = await import("../visit/visitApiClient");
        const historyResponse = await fetchCoverUpdate(siteId, groupId);

        if (!historyResponse) {
          throw new Error(
            "Failed to refetch history from backend after update. Status may not be accurate."
          );
        }

        // Find the entry for the date we just updated
        const updatedEntry = historyResponse.history.find(
          (e) => dayjs(e.date).format("YYYY-MM-DD") === date
        );

        console.log("History refetched successfully from backend", {
          historyLength: historyResponse.history.length,
          updatedDate: date,
          updatedEntry: updatedEntry,
          entryStatus: updatedEntry?.visitStatus,
          entryMergedStatus: updatedEntry?.mergedStatus,
        });

        if (!updatedEntry) {
          console.warn("Updated entry not found in refetched history", {
            date,
            allDates: historyResponse.history.map((e) =>
              dayjs(e.date).format("YYYY-MM-DD")
            ),
          });
        }

        // Update the entire history for this site with fresh data from backend
        // This ensures we have the correct merged status calculated by the backend
        storeAPI.setSiteHistory(siteId, historyResponse.history);
        console.log("History store updated with backend data", {
          siteId,
          historyLength: historyResponse.history.length,
        });
      } catch (error) {
        console.error("Failed to update history status:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update history";
        update((state) => ({
          ...state,
          error: errorMessage,
        }));
        throw error;
      }
    },
  };

  return storeAPI;
}

// Removed calculateMergedStatus - merged status is ONLY calculated by the backend
// Frontend should never generate statuses, always refetch from backend after updates

export const historyStore = createHistoryStore();

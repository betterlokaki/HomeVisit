/**
 * Visit Store
 * Single Responsibility: State management for visit cards
 */

import { writable, get } from "svelte/store";
import type { VisitCard } from "./VisitCard";
import type { SiteFilters } from "./SiteFilters";
import type { VisitStoreState } from "./VisitStoreState";
import { DEFAULT_FILTERS } from "./defaultFilters";
import { buildFilterRequest } from "./filterRequestBuilder";
import {
  fetchSites,
  updateSiteStatus as apiUpdateSiteStatus,
  fetchGroupUsers,
} from "./visitApiClient";

let currentGroup = "Weekly Refresh Group";

function createVisitStore() {
  const initialState: VisitStoreState = {
    cards: [],
    loading: false,
    error: null,
    filters: { ...DEFAULT_FILTERS },
    groupUsers: [],
  };

  const { subscribe, set, update } = writable<VisitStoreState>(initialState);

  const getState = (): VisitStoreState => get({ subscribe } as any);

  const storeAPI = {
    subscribe,

    loadVisitCards: async () => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const currentState = getState();
        const filterRequest = buildFilterRequest(currentState.filters);
        const cards = await fetchSites(currentGroup, filterRequest);

        update((state) => ({ ...state, cards, loading: false, error: null }));
      } catch (error) {
        update((state) => ({
          ...state,
          cards: [],
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    },

    updateFilters: async (newFilters: SiteFilters) => {
      update((state) => ({ ...state, filters: newFilters }));
      await storeAPI.loadVisitCards();
    },

    updateCardStatus: async (
      siteId: number,
      newStatus: "Not Seen" | "Seen" | "Partial"
    ) => {
      try {
        const state = getState();
        const card = state.cards.find((c: VisitCard) => c.site_id === siteId);
        if (!card) throw new Error("Site not found");

        await apiUpdateSiteStatus((card as any).site_name, newStatus);

        update((state) => ({
          ...state,
          cards: state.cards.map((c) =>
            c.site_id === siteId
              ? { ...c, seen_status: newStatus, seen_date: new Date() }
              : c
          ),
        }));
      } catch (error) {
        console.error("Failed to update card status:", error);
        update((state) => ({
          ...state,
          error: error instanceof Error ? error.message : "Failed to update",
        }));
      }
    },

    reset: () => set({ ...initialState, filters: { ...DEFAULT_FILTERS } }),

    loadGroupUsers: async () => {
      try {
        const users = await fetchGroupUsers(currentGroup);
        update((state) => ({ ...state, groupUsers: users }));
        return users;
      } catch (error) {
        console.error("Failed to load group users:", error);
        return [];
      }
    },

    setGroup: (groupName: string) => {
      currentGroup = groupName;
      const state = getState();
      set(state);
    },

    getGroupName: () => currentGroup,
  };

  return storeAPI;
}

export const visitStore = createVisitStore();

import { writable, get } from "svelte/store";
import type { EnrichedSite, User } from "@homevisit/common";
import { buildFilterRequest } from "./filterRequestBuilder";
import {
  fetchSites,
  updateSiteStatus as apiUpdateSiteStatus,
  fetchGroupUsers,
} from "./visitApiClient";

let currentGroup = "Weekly Refresh Group";

export type VisitCard = EnrichedSite;

export interface SiteFilters {
  selectedUsers: string[];
  awaiting: boolean;
  collection: boolean;
  completedFull: boolean;
  completedPartial: boolean;
}

export interface FilterRequest {
  usernames?: string[];
  seenStatuses?: string[];
  updatedStatuses?: string[];
}

interface VisitStoreState {
  cards: VisitCard[];
  loading: boolean;
  error: string | null;
  filters: SiteFilters;
  groupUsers: User[];
}

function createVisitStore() {
  const { subscribe, set, update } = writable<VisitStoreState>({
    cards: [],
    loading: false,
    error: null,
    filters: {
      selectedUsers: [],
      awaiting: false,
      collection: false,
      completedFull: false,
      completedPartial: false,
    },
    groupUsers: [],
  });

  const notifyGroupChange = () => {
    const state = get({ subscribe } as any) as VisitStoreState;
    set(state);
  };

  const storeAPI = {
    subscribe,

    loadVisitCards: async () => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const currentState = get({ subscribe } as any) as VisitStoreState;
        const filterRequest = buildFilterRequest(currentState.filters);
        const cards = await fetchSites(currentGroup, filterRequest);

        update((state) => ({
          ...state,
          cards,
          loading: false,
          error: null,
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          cards: [],
          loading: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        }));
      }
    },

    updateFilters: async (newFilters: SiteFilters) => {
      update((state) => ({
        ...state,
        filters: newFilters,
      }));
      await storeAPI.loadVisitCards();
    },

    updateCardStatus: async (
      siteId: number,
      newStatus: "Not Seen" | "Seen" | "Partial"
    ) => {
      try {
        const state = get({ subscribe } as any) as VisitStoreState;
        const card = state.cards.find((c: VisitCard) => c.site_id === siteId);
        if (!card) {
          throw new Error("Site not found");
        }

        const siteName = (card as any).site_name;
        await apiUpdateSiteStatus(siteName, newStatus);

        update((state) => ({
          ...state,
          cards: state.cards.map((card) =>
            card.site_id === siteId
              ? {
                  ...card,
                  seen_status: newStatus,
                  seen_date: new Date().toISOString() as any,
                }
              : card
          ),
        }));
      } catch (error) {
        console.error("Failed to update card status:", error);
        update((state) => ({
          ...state,
          error:
            error instanceof Error ? error.message : "Failed to update status",
        }));
      }
    },

    reset: () =>
      set({
        cards: [],
        loading: false,
        error: null,
        filters: {
          selectedUsers: [],
          awaiting: false,
          collection: false,
          completedFull: false,
          completedPartial: false,
        },
        groupUsers: [],
      }),

    loadGroupUsers: async () => {
      try {
        const users = await fetchGroupUsers(currentGroup);
        console.log("Parsed users:", users);
        update((state) => ({
          ...state,
          groupUsers: users,
        }));
        return users;
      } catch (error) {
        console.error("Failed to load group users:", error);
        return [];
      }
    },

    setGroup: (groupName: string) => {
      currentGroup = groupName;
      notifyGroupChange();
    },

    getGroupName: () => currentGroup,
  };

  return storeAPI;
}

export const visitStore = createVisitStore();

import { writable, get } from "svelte/store";
import type { EnrichedSite } from "@homevisit/common";

// API Configuration
const API_BASE_URL = "http://localhost:4000";
const HARDCODED_USERNAME = "shahar";
const HARDCODED_GROUP = "Weekly Refresh Group";

export type VisitCard = EnrichedSite;

export interface SiteFilters {
  username: boolean; // Button 1: Filter by current user
  awaiting: boolean; // Button 2: updatedStatus (Full|Partial) AND seen_status (Not Seen|Partial)
  collection: boolean; // Button 3: updatedStatus = "No"
  completedFull: boolean; // Button 4: seen_status = "Seen"
  completedPartial: boolean; // Button 5: seen_status = "Partial"
}

export interface FilterRequest {
  username?: string; // Only included when username filter is active
  seenStatuses?: string[]; // Array of seen_status values to match
  updatedStatuses?: string[]; // Array of updatedStatus values to match
}

interface VisitStoreState {
  cards: VisitCard[];
  loading: boolean;
  error: string | null;
  filters: SiteFilters;
}

function createVisitStore() {
  const { subscribe, set, update } = writable<VisitStoreState>({
    cards: [],
    loading: false,
    error: null,
    filters: {
      username: false,
      awaiting: false,
      collection: false,
      completedFull: false,
      completedPartial: false,
    },
  });

  // Helper to build filter request from filters state
  const buildFilterRequest = (filters: SiteFilters): FilterRequest => {
    let request: FilterRequest = {};

    // Button 1: Filter by current username - ONLY if explicitly clicked
    if (filters.username) {
      request.username = HARDCODED_USERNAME;
    }

    // Collect all seenStatuses from active buttons
    const seenStatusFilters: Set<string> = new Set();
    const updatedStatusFilters: Set<string> = new Set();

    // Button 2: updatedStatus (Full|Partial) AND seen_status (Not Seen|Partial)
    if (filters.awaiting) {
      updatedStatusFilters.add("Full");
      updatedStatusFilters.add("Partial");
      seenStatusFilters.add("Not Seen");
      seenStatusFilters.add("Partial");
    }

    // Button 3: updatedStatus = "No"
    if (filters.collection) {
      updatedStatusFilters.add("No");
    }

    // Button 4: seen_status = "Seen"
    if (filters.completedFull) {
      seenStatusFilters.add("Seen");
    }

    // Button 5: seen_status = "Partial"
    if (filters.completedPartial) {
      seenStatusFilters.add("Partial");
    }

    // Add seenStatuses if any buttons added them
    if (seenStatusFilters.size > 0) {
      request.seenStatuses = Array.from(seenStatusFilters);
    }

    // Add updatedStatuses if any buttons added them
    if (updatedStatusFilters.size > 0) {
      request.updatedStatuses = Array.from(updatedStatusFilters);
    }

    return request;
  };

  const storeAPI = {
    subscribe,

    // Async function to load visit cards from backend
    loadVisitCards: async () => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        // Get current state to access filters
        const currentState = get({ subscribe } as any) as VisitStoreState;
        const filterRequest = buildFilterRequest(currentState.filters);

        const url = new URL(`${API_BASE_URL}/sites`);
        url.searchParams.append("group", HARDCODED_GROUP);

        // Ensure proper URL encoding
        const finalUrl = url.toString().replace(/\+/g, "%20");

        const response = await fetch(finalUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filterRequest),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const sites = await response.json();
        const cards: VisitCard[] = sites;

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

    // Update filters and reload cards
    updateFilters: async (newFilters: SiteFilters) => {
      update((state) => ({
        ...state,
        filters: newFilters,
      }));

      // Reload cards with new filters
      await storeAPI.loadVisitCards();
    },

    // Update card status via backend API
    updateCardStatus: async (
      siteId: number,
      newStatus: "Not Seen" | "Seen" | "Partial"
    ) => {
      try {
        // Find the site name from the current cards
        let siteName = "";
        const state = get({ subscribe } as any) as VisitStoreState;
        const card = state.cards.find((c: VisitCard) => c.site_id === siteId);
        if (card) {
          siteName = (card as any).site_name;
        }

        if (!siteName) {
          throw new Error("Site not found");
        }

        const response = await fetch(
          `${API_BASE_URL}/sites/${encodeURIComponent(
            HARDCODED_USERNAME
          )}/${encodeURIComponent(siteName)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Update local state on successful API call
        update((state) => ({
          ...state,
          cards: state.cards.map((card) =>
            card.site_id === siteId
              ? {
                  ...card,
                  seen_status: newStatus,
                  seen_date: new Date().toISOString(),
                }
              : card
          ),
        }));
      } catch (error) {
        // Handle error - could add error state to store if needed
        console.error("Failed to update card status:", error);
        update((state) => ({
          ...state,
          error:
            error instanceof Error ? error.message : "Failed to update status",
        }));
      }
    },

    // Reset store
    reset: () =>
      set({
        cards: [],
        loading: false,
        error: null,
        filters: {
          username: false,
          awaiting: false,
          collection: false,
          completedFull: false,
          completedPartial: false,
        },
      }),

    // Getters for hardcoded constants
    getUsername: () => HARDCODED_USERNAME,
    getGroupName: () => HARDCODED_GROUP,
  };

  return storeAPI;
}

export const visitStore = createVisitStore();

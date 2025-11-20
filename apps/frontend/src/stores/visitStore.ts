import { writable } from "svelte/store";
import type { EnrichedSite } from "@homevisit/common";

// API Configuration
const API_BASE_URL = "http://localhost:4000";
const HARDCODED_USERNAME = "shahar";
const HARDCODED_GROUP = "Weekly Refresh Group";

export type VisitCard = EnrichedSite;

interface VisitStoreState {
  cards: VisitCard[];
  loading: boolean;
  error: string | null;
}

function createVisitStore() {
  const { subscribe, set, update } = writable<VisitStoreState>({
    cards: [],
    loading: false,
    error: null,
  });

  return {
    subscribe,

    // Async function to load visit cards from backend
    loadVisitCards: async () => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        const url = new URL(`${API_BASE_URL}/sites`);
        url.searchParams.append("group", HARDCODED_GROUP);
        // url.searchParams.append("username", HARDCODED_USERNAME);

        // Ensure proper URL encoding - replace + with %20 if needed
        const finalUrl = url.toString().replace(/\+/g, "%20");
        console.log("Fetching visit cards from URL:", finalUrl);

        const response = await fetch(finalUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const sites = await response.json();
        console.log("Fetched visit cards data:", sites);
        const cards: VisitCard[] = sites;

        set({
          cards,
          loading: false,
          error: null,
        });
      } catch (error) {
        set({
          cards: [],
          loading: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    },

    // Update card status via backend API
    updateCardStatus: async (
      siteId: number,
      newStatus: "Not Seen" | "Seen" | "Partial"
    ) => {
      try {
        // Find the site name from the current cards
        let siteName = "";
        update((state) => {
          const card = state.cards.find((c) => c.site_id === siteId);
          if (card) {
            siteName = card.site_name;
          }
          return state;
        });

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
      }),

    // Getters for hardcoded constants
    getUsername: () => HARDCODED_USERNAME,
    getGroupName: () => HARDCODED_GROUP,
  };
}

export const visitStore = createVisitStore();

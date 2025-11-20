import { writable } from "svelte/store";

export interface VisitCard {
  site_id: number;
  site_name: string;
  group_id: number;
  user_id: number;
  seen_status: "Not Seen" | "Seen" | "Partial";
  seen_date: string;
  geometry: string;
  updatedStatus:
    | "Not Seen"
    | "Partial"
    | "Completed"
    | "No Collection"
    | "Active"
    | "Awaiting";
  siteLink: string;
}

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

    // Async function to load visit cards
    loadVisitCards: async () => {
      update((state) => ({ ...state, loading: true, error: null }));

      try {
        // Simulate async API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const mockData: VisitCard[] = [
          {
            site_id: 1,
            site_name: "ניו יורק",
            group_id: 1,
            user_id: 1,
            seen_status: "Not Seen",
            seen_date: "2025-11-18T00:00:00",
            geometry:
              "POLYGON((-74.3 40.5, -73.9 40.6, -73.7 40.5, -73.8 40.9, -74.2 40.8, -74.3 40.5))",
            updatedStatus: "Active",
            siteLink:
              "https://homevisit.local/project?overlays=1,2,3,4,5,6,7,8",
          },
          {
            site_id: 2,
            site_name: "תל אביב",
            group_id: 1,
            user_id: 1,
            seen_status: "Partial",
            seen_date: "2025-11-17T00:00:00",
            geometry:
              "POLYGON((34.7 32.0, 34.8 32.1, 34.9 32.0, 34.8 31.9, 34.7 32.0))",
            updatedStatus: "No Collection",
            siteLink: "https://homevisit.local/project?overlays=1",
          },
          {
            site_id: 3,
            site_name: "ירושלים",
            group_id: 1,
            user_id: 1,
            seen_status: "Seen",
            seen_date: "2025-11-16T00:00:00",
            geometry:
              "POLYGON((35.2 31.7, 35.3 31.8, 35.4 31.7, 35.3 31.6, 35.2 31.7))",
            updatedStatus: "Completed",
            siteLink: "https://homevisit.local/project?overlays=5,6",
          },
          {
            site_id: 4,
            site_name: "חיפה",
            group_id: 1,
            user_id: 1,
            seen_status: "Partial",
            seen_date: "2025-11-15T00:00:00",
            geometry:
              "POLYGON((34.9 32.8, 35.0 32.9, 35.1 32.8, 35.0 32.7, 34.9 32.8))",
            updatedStatus: "Partial",
            siteLink: "https://homevisit.local/project?overlays=3,4",
          },
          {
            site_id: 5,
            site_name: "בית שמש",
            group_id: 1,
            user_id: 1,
            seen_status: "Not Seen",
            seen_date: "2025-11-14T00:00:00",
            geometry:
              "POLYGON((35.1 31.8, 35.2 31.9, 35.3 31.8, 35.2 31.7, 35.1 31.8))",
            updatedStatus: "Awaiting",
            siteLink: "https://homevisit.local/project?overlays=2,7,8",
          },
        ];

        set({
          cards: mockData,
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

    // Reset store
    reset: () =>
      set({
        cards: [],
        loading: false,
        error: null,
      }),
  };
}

export const visitStore = createVisitStore();

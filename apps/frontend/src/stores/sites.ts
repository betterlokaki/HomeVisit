/**
 * Sites Store
 *
 * Manages site data and operations for the current authenticated user.
 * Fetches enriched sites from the backend instead of PostgREST directly.
 */

import { writable, derived } from "svelte/store";
import axios from "axios";
import type { EnrichedSite } from "@homevisit/common//src";

const BACKEND_URL = "http://localhost:4000";

export interface SitesState {
  sites: EnrichedSite[];
  selectedSiteId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: SitesState = {
  sites: [],
  selectedSiteId: null,
  loading: false,
  error: null,
};

/**
 * Create the sites store
 */
function createSitesStore() {
  const { subscribe, set, update } = writable<SitesState>(initialState);

  return {
    subscribe,

    /**
     * Fetch all sites for a given user from the backend
     * @param userId - The user's ID
     */
    fetchUserSites: async (userId: number) => {
      update((s) => ({ ...s, loading: true, error: null }));
      try {
        const response = await axios.get(`${BACKEND_URL}/sites/userSites`, {
          params: { user_id: userId },
        });

        update((s) => ({
          ...s,
          sites: response.data.data.sites,
          loading: false,
        }));
        return response.data.data.sites;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || "Failed to load sites";
        update((s) => ({ ...s, loading: false, error: errorMsg }));
        throw err;
      }
    },

    /**
     * Select a site
     * @param siteId - The site to select, or null to deselect
     */
    selectSite: (siteId: number | null) => {
      update((s) => ({ ...s, selectedSiteId: siteId }));
    },

    /**
     * Clear error message
     */
    clearError: () => {
      update((s) => ({ ...s, error: null }));
    },

    /**
     * Reset sites to initial state
     */
    reset: () => {
      set(initialState);
    },
  };
}

export const sitesStore = createSitesStore();

/**
 * Derived store to get the currently selected site
 */
export const selectedSite = derived(sitesStore, ($sites) => {
  if (!$sites.selectedSiteId) return null;
  return $sites.sites.find((s) => s.site_id === $sites.selectedSiteId) || null;
});

/**
 * Derived store to get all sites as a map for quick lookup
 */
export const sitesMap = derived(sitesStore, ($sites) => {
  const map = new Map<number, EnrichedSite>();
  $sites.sites.forEach((site) => map.set(site.site_id, site));
  return map;
});

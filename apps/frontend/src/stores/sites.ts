/**
 * Sites Store
 *
 * Manages site data and selected site state.
 */

import { writable, derived } from "svelte/store";
import type { EnrichedSite } from "@homevisit/common/src";
import { fetchUserSites } from "../services/sitesService";
import { ERROR_LOAD_SITES } from "../config/constants";

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

function createSitesStore() {
  const { subscribe, set, update } = writable<SitesState>(initialState);

  return {
    subscribe,
    fetchUserSites: async (userId: number) => {
      update((s) => ({ ...s, loading: true, error: null }));
      try {
        const sites = await fetchUserSites(userId);
        update((s) => ({ ...s, sites, loading: false }));
        return sites;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || ERROR_LOAD_SITES;
        update((s) => ({ ...s, loading: false, error: errorMsg }));
        throw err;
      }
    },
    selectSite: (siteId: number | null) =>
      update((s) => ({ ...s, selectedSiteId: siteId })),
    clearError: () => update((s) => ({ ...s, error: null })),
    reset: () => set(initialState),
  };
}

export const sitesStore = createSitesStore();
export const selectedSite = derived(sitesStore, ($sites) =>
  $sites.selectedSiteId
    ? $sites.sites.find((s) => s.site_id === $sites.selectedSiteId) || null
    : null
);
export const sitesMap = derived(sitesStore, ($sites) => {
  const map = new Map<number, EnrichedSite>();
  $sites.sites.forEach((site) => map.set(site.site_id, site));
  return map;
});

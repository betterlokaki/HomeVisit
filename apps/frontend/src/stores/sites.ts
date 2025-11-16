/**
 * Sites Store
 * 
 * Manages site data and operations for the current authenticated user.
 * Provides methods to fetch sites, update status, and manage site selection.
 * 
 * Usage:
 * ```typescript
 * import { sitesStore, fetchUserSites, updateSiteStatus } from './sites';
 * 
 * // Fetch sites for a user
 * await fetchUserSites(userId);
 * 
 * // Update a site's status
 * await updateSiteStatus(siteId, 'online');
 * 
 * // Subscribe to sites
 * sitesStore.subscribe(state => {
 *   console.log('Sites:', state.sites);
 * });
 * ```
 */

import { writable, derived } from 'svelte/store';
import axios from 'axios';

const POSTGREST_URL = (typeof window !== 'undefined' && (import.meta.env as any).VITE_POSTGREST_URL) || 'http://localhost:3000';

export interface Site {
  site_id: number;
  site_code: string;
  name: string;
  geometry: {
    type: string;
    coordinates: [number, number];
    crs?: object;
  };
  status: 'online' | 'offline' | 'maintenance';
  last_seen: string;
  last_data: string;
  created_at: string;
  updated_at: string;
}

export interface SitesState {
  sites: Site[];
  selectedSiteId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: SitesState = {
  sites: [],
  selectedSiteId: null,
  loading: false,
  error: null
};

/**
 * Create the sites store
 */
function createSitesStore() {
  const { subscribe, set, update } = writable<SitesState>(initialState);

  return {
    subscribe,

    /**
     * Fetch all sites for a given user
     * @param userId - The user's ID
     */
    fetchUserSites: async (userId: number) => {
      update(s => ({ ...s, loading: true, error: null }));
      try {
        const response = await axios.post(`${POSTGREST_URL}/rpc/get_user_sites`, {
          p_user_id: userId
        });

        update(s => ({
          ...s,
          sites: response.data,
          loading: false
        }));
        return response.data;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to load sites';
        update(s => ({ ...s, loading: false, error: errorMsg }));
        throw err;
      }
    },

    /**
     * Update a site's status
     * @param siteId - The site's ID
     * @param newStatus - The new status ('online', 'offline', or 'maintenance')
     */
    updateSiteStatus: async (siteId: number, newStatus: 'online' | 'offline' | 'maintenance') => {
      try {
        await axios.post(`${POSTGREST_URL}/rpc/update_site_status`, {
          p_site_id: siteId,
          p_new_status: newStatus
        });

        // Update local state optimistically
        update(s => ({
          ...s,
          sites: s.sites.map(site =>
            site.site_id === siteId
              ? { ...site, status: newStatus, last_seen: new Date().toISOString() }
              : site
          )
        }));
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to update site status';
        update(s => ({ ...s, error: errorMsg }));
        throw err;
      }
    },

    /**
     * Select a site
     * @param siteId - The site to select, or null to deselect
     */
    selectSite: (siteId: number | null) => {
      update(s => ({ ...s, selectedSiteId: siteId }));
    },

    /**
     * Clear error message
     */
    clearError: () => {
      update(s => ({ ...s, error: null }));
    },

    /**
     * Reset sites to initial state
     */
    reset: () => {
      set(initialState);
    }
  };
}

export const sitesStore = createSitesStore();

/**
 * Derived store to get the currently selected site
 */
export const selectedSite = derived(sitesStore, $sites => {
  if (!$sites.selectedSiteId) return null;
  return $sites.sites.find(s => s.site_id === $sites.selectedSiteId) || null;
});

/**
 * Derived store to get all sites as a map for quick lookup
 */
export const sitesMap = derived(sitesStore, $sites => {
  const map = new Map<number, Site>();
  $sites.sites.forEach(site => map.set(site.site_id, site));
  return map;
});

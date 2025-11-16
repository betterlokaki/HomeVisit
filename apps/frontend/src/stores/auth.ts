/**
 * Auth Store
 * 
 * Manages authentication state with username-only login/registration.
 * Persists authentication state to localStorage for session persistence.
 * 
 * Usage:
 * ```typescript
 * import { authStore, login, register, logout } from './auth';
 * 
 * // Subscribe to auth state
 * authStore.subscribe(state => {
 *   console.log('Auth state:', state);
 * });
 * 
 * // Login/Register (same RPC call)
 * await login('username');
 * 
 * // Logout
 * logout();
 * ```
 */

import { writable, derived } from 'svelte/store';
import axios from 'axios';

const POSTGREST_URL = import.meta.env.VITE_POSTGREST_URL || 'http://localhost:3000';
const STORAGE_KEY = 'homevisit_auth';

export interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  username: string | null;
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  username: null,
  error: null,
  loading: false
};

/**
 * Create the auth store with initial state from localStorage
 */
function createAuthStore() {
  // Try to restore auth state from localStorage
  let restored = initialState;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        restored = JSON.parse(stored);
      } catch (e) {
        console.warn('Failed to restore auth state from localStorage', e);
      }
    }
  }

  const { subscribe, set, update } = writable<AuthState>(restored);

  return {
    subscribe,

    /**
     * Login or register with just a username
     * @param username - User's username
     * @throws Error if authentication fails
     */
    login: async (username: string) => {
      update(s => ({ ...s, loading: true, error: null }));
      try {
        const response = await axios.post(`${POSTGREST_URL}/rpc/get_or_create_user`, {
          p_username: username
        });

        // PostgREST returns scalar values directly
        const userId = typeof response.data === 'number' ? response.data : response.data[0];

        if (!userId) {
          throw new Error('Failed to authenticate');
        }

        const newState: AuthState = {
          isAuthenticated: true,
          userId,
          username,
          error: null,
          loading: false
        };

        set(newState);
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        }

        return newState;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'Authentication failed';
        update(s => ({ ...s, loading: false, error: errorMsg }));
        throw err;
      }
    },

    /**
     * Log out the current user
     */
    logout: () => {
      set(initialState);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    /**
     * Clear error message
     */
    clearError: () => {
      update(s => ({ ...s, error: null }));
    }
  };
}

export const authStore = createAuthStore();

/**
 * Derived store to get isAuthenticated status
 */
export const isAuthenticated = derived(authStore, $auth => $auth.isAuthenticated);

/**
 * Derived store to get current user
 */
export const currentUser = derived(authStore, $auth => ({
  id: $auth.userId,
  username: $auth.username
}));

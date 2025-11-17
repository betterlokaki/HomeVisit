/**
 * Auth Store
 *
 * Manages authentication state with localStorage persistence.
 */

import { writable, derived } from "svelte/store";
import { authenticateUser } from "../services/authService";
import {
  AUTH_STORAGE_KEY,
  ERROR_AUTH_FAILED,
  ERROR_RESTORE_AUTH,
} from "../config/constants";

export interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  groupId: number | null;
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  groupId: null,
  error: null,
  loading: false,
};

function createAuthStore() {
  let restored = initialState;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        restored = JSON.parse(stored);
      } catch (e) {
        console.warn(ERROR_RESTORE_AUTH, e);
      }
    }
  }

  const { subscribe, set, update } = writable<AuthState>(restored);

  return {
    subscribe,
    login: async (groupId: number = 1) => {
      update((s) => ({ ...s, loading: true, error: null }));
      try {
        const userId = await authenticateUser(groupId);
        const newState = {
          isAuthenticated: true,
          userId,
          groupId,
          error: null,
          loading: false,
        };
        set(newState);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || ERROR_AUTH_FAILED;
        update((s) => ({ ...s, loading: false, error: errorMsg }));
        throw err;
      }
    },
    logout: () => {
      set(initialState);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    },
    clearError: () => update((s) => ({ ...s, error: null })),
  };
}

export const authStore = createAuthStore();
export const isAuthenticated = derived(
  authStore,
  ($auth) => $auth.isAuthenticated
);
export const currentUser = derived(authStore, ($auth) => ({
  id: $auth.userId,
  groupId: $auth.groupId,
}));

/**
 * Frontend Configuration
 *
 * Loads environment variables from .env files.
 * All URLs come from .env, never hardcoded.
 */

// ============================================================================
// API Endpoints (from Environment)
// ============================================================================
export const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
export const API_TIMEOUT = parseInt(
  import.meta.env.VITE_API_TIMEOUT || "5000",
  10
);

// ============================================================================
// Backend Endpoints
// ============================================================================
export const BACKEND_AUTH_ENDPOINT = "/auth/login";
export const BACKEND_SITES_ENDPOINT = "/sites/userSites";

// ============================================================================
// Local Storage Keys
// ============================================================================
export const AUTH_STORAGE_KEY = "homevisit_auth";

// ============================================================================
// Error Messages
// ============================================================================
export const ERROR_AUTH_FAILED = "Authentication failed";
export const ERROR_LOAD_SITES = "Failed to load sites";
export const ERROR_RESTORE_AUTH =
  "Failed to restore auth state from localStorage";

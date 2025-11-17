/**
 * Frontend Configuration with Validation
 *
 * Loads and validates environment variables using Zod.
 * All URLs come from .env files, never hardcoded.
 */

import { z } from "zod";

const frontendEnvSchema = z.object({
  VITE_BACKEND_URL: z.string().url().default("http://localhost:4000"),
  VITE_POSTGREST_URL: z.string().url().default("http://localhost:3000"),
  VITE_API_TIMEOUT: z.coerce.number().default(5000),
});

type FrontendEnvConfig = z.infer<typeof frontendEnvSchema>;

function validateFrontendEnv(): FrontendEnvConfig {
  try {
    return frontendEnvSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Frontend environment validation failed:");
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
    }
    throw new Error("Invalid frontend environment configuration");
  }
}

const env = validateFrontendEnv();

// ============================================================================
// API Endpoints (from Environment)
// ============================================================================
export const API_BASE_URL = env.VITE_BACKEND_URL;
export const POSTGREST_BASE_URL = env.VITE_POSTGREST_URL;
export const API_TIMEOUT = env.VITE_API_TIMEOUT;

// ============================================================================
// PostgREST Endpoints
// ============================================================================
export const POSTGREST_RPC_AUTH_ENDPOINT = "/rpc/get_or_create_user";
export const POSTGREST_AUTH_PARAM = "p_username";

// ============================================================================
// Backend Endpoints
// ============================================================================
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

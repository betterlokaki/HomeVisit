/**
 * Application Constants (Derived from Environment)
 *
 * These are computed from validated environment variables.
 * Do NOT add hardcoded magic strings here - they should come from env.ts
 */

import { config } from "./env.js";

// ============================================================================
// CORS Configuration
// ============================================================================
export const CORS_ORIGINS = [config.CORS_ORIGIN_1, config.CORS_ORIGIN_2];

// ============================================================================
// Server Configuration
// ============================================================================
export const SERVER_TIMEOUT = config.SERVER_TIMEOUT;
export const REQUEST_JSON_LIMIT = config.REQUEST_JSON_LIMIT;

// ============================================================================
// PostgREST Configuration
// ============================================================================
export const POSTGREST_RPC_AUTH_ENDPOINT = config.POSTGREST_RPC_AUTH_ENDPOINT;
export const POSTGREST_RPC_SITES_ENDPOINT = config.POSTGREST_RPC_SITES_ENDPOINT;
export const POSTGREST_QUERY_PARAM = config.POSTGREST_QUERY_PARAM;
export const POSTGREST_AUTH_PARAM = config.POSTGREST_AUTH_PARAM;

// ============================================================================
// Site Enrichment Configuration
// ============================================================================
export const SITE_STATUS_OPTIONS = config.SITE_STATUS_OPTIONS.split(",");
export const STATUS_CALCULATION_DELAY_MS = config.STATUS_CALCULATION_DELAY_MS;
export const SITE_LINK_DOMAIN = config.SITE_LINK_DOMAIN;
export const ELASTIC_PROVIDER_BASE_URL = config.ELASTIC_PROVIDER_BASE_URL;
export const ELASTIC_PROVIDER_ENDPOINT = config.ELASTIC_PROVIDER_ENDPOINT;
export const PROJECT_LINK_FORMAT = config.PROJECT_LINK_FORMAT;

// ============================================================================
// API Response Configuration
// ============================================================================
export const RESPONSE_SUCCESS_FIELD = "success";
export const RESPONSE_DATA_FIELD = "data";
export const ERROR_FIELD = "error";
export const MESSAGE_FIELD = "message";

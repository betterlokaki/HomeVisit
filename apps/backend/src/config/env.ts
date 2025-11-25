/**
 * Environment Configuration with Validation
 *
 * Loads and validates environment variables using Zod.
 * Throws on startup if required variables are missing or invalid.
 */

import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  POSTGREST_URL: z.string().url(),
  CORS_ORIGIN_1: z.string().url(),
  CORS_ORIGIN_2: z.string().url(),
  SERVER_TIMEOUT: z.coerce.number().default(5000),
  REQUEST_JSON_LIMIT: z.string().default("1mb"),
  ALLOWED_HOSTS: z.string().default("localhost,127.0.0.1"),
  POSTGREST_RPC_AUTH_ENDPOINT: z.string().default("/rpc/get_or_create_user"),
  POSTGREST_RPC_SITES_ENDPOINT: z.string().default("/rpc/get_user_sites"),
  POSTGREST_AUTH_PARAM: z.string().default("p_group_id"),
  POSTGREST_QUERY_PARAM: z.string().default("p_user_id"),
  SITE_STATUS_OPTIONS: z.string().default("Full,Partial,No"),
  STATUS_CALCULATION_DELAY_MS: z.coerce.number().default(1000),
  SITE_LINK_DOMAIN: z.string().default("homevisit.local"),
  ELASTIC_PROVIDER_BASE_URL: z.string().url(),
  ELASTIC_PROVIDER_ENDPOINT: z.string().default("/health"),
  PROJECT_LINK_FORMAT: z
    .string()
    .default("https://homevisit.local/project?overlays={overlayIds}"),
  OVERLAY_SERVICE_QUERY_PARAMS: z.string().default(""),
  OVERLAY_SERVICE_HEADERS: z.string().default(""),
});

type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
    }
    throw new Error("Invalid environment configuration");
  }
}

export const config = validateEnv();

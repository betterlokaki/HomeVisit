import * as fs from "fs";
import * as path from "path";
import { logger } from "../middleware/logger.js";

export interface RequestKeys {
  outerKey: string;
  dataKey: string;
  dateKey: string;
}

export interface EnrichmentServiceConfig {
  url: string;
  headers: Record<string, string>;
  requestKeys: RequestKeys;
}

export interface EnrichmentConfig {
  enrichmentService: EnrichmentServiceConfig;
}

let enrichmentConfig: EnrichmentConfig | null = null;

export function loadEnrichmentConfig(): EnrichmentConfig {
  if (enrichmentConfig) {
    return enrichmentConfig;
  }

  const configPath = path.join(process.cwd(), "config.json");
  try {
    const configData = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(configData) as EnrichmentConfig;
    enrichmentConfig = parsed;
    logger.info("Enrichment config loaded successfully");
    return parsed;
  } catch (error) {
    logger.error("Failed to load enrichment config from config.json", error);
    throw new Error(
      "Enrichment service configuration not found. Please ensure config.json exists."
    );
  }
}

export function getEnrichmentConfig(): EnrichmentConfig {
  if (!enrichmentConfig) {
    throw new Error(
      "Enrichment config not loaded. Call loadEnrichmentConfig() first."
    );
  }
  return enrichmentConfig;
}

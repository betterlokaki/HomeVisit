/**
 * Cover Update Service - Fetches cover update history from external service
 */

import type { CoverUpdateEntry, CoverUpdateResponse } from "@homevisit/common";
import type { ICoverUpdateService } from "./interfaces/ICoverUpdateService.ts";
import { logger } from "../../middleware/logger.ts";
import { getEnrichmentConfig } from "../../config/enrichmentConfig.ts";
import type { CoverUpdateServiceConfig } from "../../config/types/index.ts";
import axios from "axios";

export class CoverUpdateService implements ICoverUpdateService {
  private config: CoverUpdateServiceConfig;

  constructor() {
    this.config = getEnrichmentConfig().coverUpdateService;
  }

  async getCoverUpdates(
    geometry: string,
    refreshTimeMs: number
  ): Promise<CoverUpdateEntry[]> {
    try {
      const refreshTimeSeconds = Math.floor(refreshTimeMs / 1000);

      const response = await axios.post<CoverUpdateResponse>(
        this.config.url,
        { geometry, refresh_time: refreshTimeSeconds },
        { headers: this.config.headers, proxy: false }
      );

      const entries = response.data[this.config.responseKey];
      if (!entries) {
        logger.warn("No cover update data found", {
          responseKey: this.config.responseKey,
        });
        return [];
      }

      return entries;
    } catch (error) {
      logger.error("Failed to fetch cover updates", { error });
      return [];
    }
  }
}

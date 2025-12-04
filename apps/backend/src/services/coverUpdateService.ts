/**
 * Cover Update Service - Fetches cover update history from external service
 */

import type { CoverUpdateEntry, CoverUpdateResponse } from "@homevisit/common";
import type { ICoverUpdateService } from "../interfaces/ICoverUpdateService.ts";
import { logger } from "../middleware/logger.ts";
import {
  getEnrichmentConfig,
  type CoverUpdateServiceConfig,
} from "../config/enrichmentConfig.ts";
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
      // Convert milliseconds to seconds for the mock service
      const refreshTimeSeconds = Math.floor(refreshTimeMs / 1000);

      const response = await axios.post<CoverUpdateResponse>(
        this.config.url,
        {
          geometry,
          refresh_time: refreshTimeSeconds,
        },
        {
          headers: this.config.headers,
          proxy: false,
        }
      );

      // Extract data using the configured response key
      const entries = response.data[this.config.responseKey];
      if (!entries) {
        logger.warn("No cover update data found in response", {
          responseKey: this.config.responseKey,
        });
        return [];
      }

      return entries;
    } catch (error) {
      logger.error("Failed to fetch cover updates from external service", {
        error,
      });
      return [];
    }
  }
}

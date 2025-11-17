/**
 * PostgREST HTTP Client
 *
 * Handles all communication with PostgREST API.
 */

import axios, { AxiosInstance } from "axios";
import { config } from "../config/env.js";
import {
  SERVER_TIMEOUT,
  POSTGREST_RPC_AUTH_ENDPOINT,
  POSTGREST_RPC_SITES_ENDPOINT,
  POSTGREST_QUERY_PARAM,
  POSTGREST_AUTH_PARAM,
} from "../config/constants.js";
import { logger } from "../middleware/logger.js";
import type { Site } from "@homevisit/common";

class PostgRESTService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.POSTGREST_URL,
      timeout: SERVER_TIMEOUT,
      headers: { "Content-Type": "application/json" },
    });
  }

  /**
   * Fetch user sites from PostgREST
   */
  async getUserSites(userId: number): Promise<Site[]> {
    try {
      logger.debug("Fetching sites from PostgREST", { userId });
      const response = await this.client.get(
        `${POSTGREST_RPC_SITES_ENDPOINT}?${POSTGREST_QUERY_PARAM}=${userId}`
      );
      logger.info("Successfully fetched sites from PostgREST", {
        userId,
        count: response.data?.length,
      });
      return response.data || [];
    } catch (error) {
      logger.error("Failed to fetch from PostgREST", error);
      throw error;
    }
  }

  /**
   * Get or create user via PostgREST RPC function
   */
  async getOrCreateUser(username: string): Promise<number> {
    try {
      logger.debug("Getting or creating user via PostgREST", { username });
      const response = await this.client.post(POSTGREST_RPC_AUTH_ENDPOINT, {
        [POSTGREST_AUTH_PARAM]: username,
      });
      const userId =
        typeof response.data === "number" ? response.data : response.data[0];
      logger.info("Successfully got or created user", { username, userId });
      return userId;
    } catch (error) {
      logger.error("Failed to get or create user", error);
      throw error;
    }
  }
}

export const postgrestService = new PostgRESTService();

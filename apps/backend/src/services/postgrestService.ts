/**
 * Service to interact with PostgREST API
 */

import axios, { AxiosInstance } from "axios";
import { config } from "../config/env.js";
import { logger } from "../middleware/logger.js";

interface Site {
  site_id: number;
  site_code: string;
  name: string;
  geometry: any;
  status: string;
  last_seen: string;
  last_data: string;
  created_at: string;
  updated_at: string;
}

class PostgRESTService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.postgrestUrl,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Fetch user sites from PostgREST
   * Calls the get_user_sites RPC function
   *
   * @param userId - The ID of the user
   * @returns Promise<Site[]> - Array of sites for the user
   */
  async getUserSites(userId: number): Promise<Site[]> {
    try {
      logger.debug("Fetching sites from PostgREST", { userId });

      // Call the RPC function via PostgREST
      const response = await this.client.get(
        `/rpc/get_user_sites?p_user_id=${userId}`
      );

      logger.info("Successfully fetched sites from PostgREST", {
        userId,
        count: response.data.length,
      });

      return response.data;
    } catch (error) {
      logger.error("Failed to fetch sites from PostgREST", error);
      throw new Error(`Failed to fetch sites for user ${userId}`);
    }
  }
}

export const postgrestService = new PostgRESTService();

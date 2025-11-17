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

interface Group {
  group_id: number;
  group_name: string;
  data_refreshments: number;
}

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
  async getOrCreateUser(groupId: number = 1): Promise<number> {
    try {
      logger.debug("Getting or creating user via PostgREST", { groupId });
      const response = await this.client.post(POSTGREST_RPC_AUTH_ENDPOINT, {
        [POSTGREST_AUTH_PARAM]: groupId,
      });
      const userId =
        typeof response.data === "number" ? response.data : response.data[0];
      logger.info("Successfully got or created user", { groupId, userId });
      return userId;
    } catch (error) {
      logger.error("Failed to get or create user", error);
      throw error;
    }
  }

  /**
   * Fetch all groups from PostgREST
   */
  async getAllGroups(): Promise<Group[]> {
    try {
      logger.debug("Fetching all groups from PostgREST");
      const response = await this.client.get("/groups");
      logger.info("Successfully fetched groups from PostgREST", {
        count: response.data?.length,
      });
      return response.data || [];
    } catch (error) {
      logger.error("Failed to fetch groups from PostgREST", error);
      throw error;
    }
  }

  /**
   * Refresh expired statuses for a group via RPC function
   * Resets sites back to 'Not Seen' if their countdown has expired
   */
  async refreshExpiredStatuses(groupId: number): Promise<number> {
    try {
      logger.debug("Calling refresh_expired_statuses RPC", { groupId });
      const response = await this.client.post("/rpc/refresh_expired_statuses", {
        p_group_id: groupId,
      });
      const refreshedCount =
        typeof response.data === "number" ? response.data : 0;
      logger.debug("Successfully called refresh_expired_statuses", {
        groupId,
        refreshedCount,
      });
      return refreshedCount;
    } catch (error) {
      logger.error("Failed to refresh expired statuses", error);
      throw error;
    }
  }

  /**
   * Fetch sites by group name with optional username and status filters
   * Uses JOINs to connect sites with users and groups tables
   */
  async getSites(
    groupName: string,
    username?: string,
    status?: string
  ): Promise<Site[]> {
    try {
      logger.debug("Fetching sites by group", { groupName, username, status });

      // Build query string with filters
      let query = `/sites?select=*&groups(group_name)=eq.${groupName}`;

      if (username) {
        query += `&users(username)=eq.${username}`;
      }

      if (status) {
        query += `&seen_status=eq.${status}`;
      }

      const response = await this.client.get(query);
      logger.info("Successfully fetched sites by group", {
        groupName,
        username,
        status,
        count: response.data?.length,
      });
      return response.data || [];
    } catch (error) {
      logger.error("Failed to fetch sites by group", error);
      throw error;
    }
  }
}

export const postgrestService = new PostgRESTService();

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
      // Convert geometry from GeoJSON to WKT format
      return (response.data || []).map((site: any) => ({
        ...site,
        geometry: this.geometryToWKT(site.geometry),
      }));
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
   * Get group by name from PostgREST
   */
  async getGroupByName(groupName: string): Promise<Group | null> {
    try {
      logger.debug("Fetching group by name from PostgREST", { groupName });
      const response = await this.client.get(
        `/groups?group_name=eq.${encodeURIComponent(groupName)}`
      );
      const group = response.data?.[0];
      if (group) {
        logger.info("Successfully fetched group by name from PostgREST", {
          groupName,
          groupId: group.group_id,
        });
      } else {
        logger.warn("Group not found", { groupName });
      }
      return group || null;
    } catch (error) {
      logger.error("Failed to fetch group by name from PostgREST", error);
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
   * Filters sites by group_id and optionally by username and seen_status
   */
  async getSites(
    groupName: string,
    username?: string,
    status?: string
  ): Promise<Site[]> {
    try {
      logger.debug("Fetching sites by group", { groupName, username, status });

      // First, get the group_id by group name
      const group = await this.getGroupByName(groupName);
      if (!group) {
        logger.warn("Group not found", { groupName });
        return [];
      }

      // Fetch all users for this group to create a lookup map
      const usersResponse = await this.client.get(
        `/users?group_id=eq.${group.group_id}&select=user_id,username`
      );
      const userMap = new Map(
        (usersResponse.data || []).map((u: any) => [u.user_id, u.username])
      );

      // Build query string to filter sites by group_id
      let query = `/sites?group_id=eq.${group.group_id}&select=site_id,site_name,group_id,user_id,seen_status,seen_date,geometry`;

      // If username provided, get user_id and filter by it
      if (username) {
        const userResponse = await this.client.get(
          `/users?username=eq.${encodeURIComponent(username)}`
        );
        const user = userResponse.data?.[0];
        if (user) {
          query += `&user_id=eq.${user.user_id}`;
        }
      }

      // Add status filter if provided
      if (status) {
        query += `&seen_status=eq.${encodeURIComponent(status)}`;
      }

      const response = await this.client.get(query);
      logger.info("Successfully fetched sites by group", {
        groupName,
        username,
        status,
        count: response.data?.length,
      });
      // Convert geometry from GeoJSON to WKT format and map user_id to username
      return (response.data || []).map((site: any) => ({
        site_id: site.site_id,
        site_name: site.site_name,
        group_id: site.group_id,
        username: userMap.get(site.user_id) || "",
        seen_status: site.seen_status,
        seen_date: site.seen_date,
        geometry: this.geometryToWKT(site.geometry),
      }));
    } catch (error) {
      logger.error("Failed to fetch sites by group", error);
      throw error;
    }
  }

  /**
   * Update a site's seen_status by username and site name
   */
  async updateSiteStatus(
    username: string,
    siteName: string,
    status: string
  ): Promise<any> {
    try {
      logger.debug("Updating site status", { username, siteName, status });

      // First, get the user_id from username
      const userResponse = await this.client.get(
        `/users?username=eq.${encodeURIComponent(username)}&select=user_id`
      );

      if (!userResponse.data || userResponse.data.length === 0) {
        logger.warn("User not found", { username });
        return null;
      }

      const user = userResponse.data[0];
      const userId = user.user_id;

      // Now fetch the site by user_id and site_name
      const siteQuery = `/sites?user_id=eq.${userId}&site_name=eq.${encodeURIComponent(
        siteName
      )}&select=site_id`;

      const siteResponse = await this.client.get(siteQuery);

      if (!siteResponse.data || siteResponse.data.length === 0) {
        logger.warn("Site not found", { username, siteName });
        return null;
      }

      const site = siteResponse.data[0];

      // Update the site's seen_status
      const updateResponse = await this.client.patch(
        `/sites?site_id=eq.${site.site_id}`,
        { seen_status: status }
      );

      logger.info("Successfully updated site status", {
        username,
        siteName,
        status,
        siteId: site.site_id,
      });

      return updateResponse.data;
    } catch (error) {
      logger.error("Failed to update site status", error);
      throw error;
    }
  }

  /**
   * Convert GeoJSON Polygon to WKT (Well-Known Text) format
   */
  private geometryToWKT(geometry: any): string {
    if (!geometry || !geometry.coordinates) {
      return "";
    }

    // Extract coordinates from GeoJSON Polygon
    const rings = geometry.coordinates;
    const wktRings = rings
      .map((ring: number[][]) => {
        const coords = ring
          .map((coord: number[]) => `${coord[0]} ${coord[1]}`)
          .join(", ");
        return `(${coords})`;
      })
      .join(", ");

    return `POLYGON(${wktRings})`;
  }
}

export const postgrestService = new PostgRESTService();

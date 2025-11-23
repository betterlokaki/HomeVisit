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
   * Fetch sites with advanced filtering at database level
   * Filters: username (via user_id), seenStatuses, updatedStatuses (requires runtime calculation)
   */
  async getSitesWithFilters(
    groupName: string,
    filters?: {
      username?: string;
      seenStatuses?: string[];
      updatedStatuses?: string[];
    }
  ): Promise<Site[]> {
    try {
      logger.debug("Fetching sites with filters", { groupName, filters });

      // Get the group
      const group = await this.getGroupByName(groupName);
      if (!group) {
        logger.warn("Group not found", { groupName });
        return [];
      }

      // Build base query
      let queryParams: string[] = [`group_id=eq.${group.group_id}`];

      logger.debug("Starting query build", {
        groupId: group.group_id,
        hasUsernameFilter: !!filters?.username,
        usernameValue: filters?.username,
      });

      // Fetch users for username filtering
      let userIdFilter: number | undefined;
      if (filters?.username) {
        logger.debug("Username filter is set, fetching user_id", {
          username: filters.username,
        });
        const userResponse = await this.client.get(
          `/users?username=eq.${encodeURIComponent(
            filters.username
          )}&select=user_id`
        );
        if (userResponse.data?.[0]) {
          userIdFilter = userResponse.data[0].user_id;
          queryParams.push(`user_id=eq.${userIdFilter}`);
          logger.debug("Added user_id filter", { userIdFilter });
        }
      } else {
        logger.debug("No username filter - NOT adding user_id to query");
      }

      // Add seen_status filter if provided - use PostgREST IN operator
      if (filters?.seenStatuses && filters.seenStatuses.length > 0) {
        const statusList = filters.seenStatuses.map((s) => `"${s}"`).join(",");
        queryParams.push(`seen_status=in.(${statusList})`);
        logger.debug("Added seen_status filter", { statusList });
      }

      // Build final query
      const query = `/sites?${queryParams.join(
        "&"
      )}&select=site_id,site_name,group_id,user_id,seen_status,seen_date,geometry`;

      logger.debug("PostgREST query for filters", {
        query,
        queryParams,
        hasUsername: !!filters?.username,
        hasSeenStatuses: !!(
          filters?.seenStatuses && filters.seenStatuses.length > 0
        ),
      });
      const response = await this.client.get(query);
      const sites = response.data || [];

      // Count unique users in response
      const uniqueUsers = new Set(sites.map((s: any) => s.user_id));

      logger.info("Successfully fetched sites with filters", {
        groupName,
        filtersApplied: {
          username: filters?.username,
          seenStatuses: filters?.seenStatuses,
        },
        sitesReturned: sites.length,
        uniqueUsersInResponse: uniqueUsers.size,
        userIds: Array.from(uniqueUsers),
        siteDetails: sites.map((s: any) => ({
          site_id: s.site_id,
          user_id: s.user_id,
          seen_status: s.seen_status,
        })),
      });

      // Fetch user map for username resolution
      const usersResponse = await this.client.get(
        `/users?group_id=eq.${group.group_id}&select=user_id,username`
      );
      const userMap = new Map(
        (usersResponse.data || []).map((u: any) => [u.user_id, u.username])
      );

      return (sites as any[]).map((site: any) => ({
        site_id: site.site_id,
        site_name: site.site_name,
        group_id: site.group_id,
        username: userMap.get(site.user_id) || "",
        seen_status: site.seen_status,
        seen_date: site.seen_date,
        geometry: this.geometryToWKT(site.geometry),
      })) as any;
    } catch (error) {
      logger.error("Failed to fetch sites with filters", error);
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
  ): Promise<boolean> {
    try {
      logger.debug("Updating site status", {
        siteName,
        status,
        updatedByUser: username,
      });

      // Get site by site_name only (ANY user can update ANY site)
      const siteResponse = await this.client.get(
        `/sites?site_name=eq.${encodeURIComponent(siteName)}&select=site_id`
      );

      if (!siteResponse.data?.[0]) {
        logger.warn("Site not found for update", { siteName });
        return false;
      }

      const siteId = siteResponse.data[0].site_id;

      // Update the site's seen_status (any user can update any site)
      await this.client.patch(`/sites?site_id=eq.${siteId}`, {
        seen_status: status,
      });

      logger.info("Site status updated", {
        siteName,
        status,
        updatedByUser: username,
      });
      return true;
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

import type { Site, SeenStatus } from "@homevisit/common";
import { PostgRESTClient } from "./postgrestClient.js";
import { logger } from "../middleware/logger.js";

export class SiteService {
  constructor(private postgrest: PostgRESTClient) {}

  private async getGroupId(groupName: string): Promise<number | null> {
    const resp = await this.postgrest.get<{ group_id: number }>(
      `/groups?group_name=eq.${encodeURIComponent(
        groupName
      )}&select=group_id&limit=1`
    );
    return resp.data?.[0]?.group_id || null;
  }

  private async getUserId(username: string): Promise<number | null> {
    const resp = await this.postgrest.get<{ user_id: number }>(
      `/users?username=eq.${encodeURIComponent(
        username
      )}&select=user_id&limit=1`
    );
    return resp.data?.[0]?.user_id || null;
  }

  private buildQuery(
    groupId: number,
    userId?: number,
    seenStatuses?: string[]
  ): string {
    const filters = [`group_id=eq.${groupId}`];
    if (userId) filters.push(`user_id=eq.${userId}`);
    if (seenStatuses?.length) {
      const list = seenStatuses.map((s) => `"${s}"`).join(",");
      filters.push(`seen_status=in.(${list})`);
    }
    const query = filters.join("&");
    return `/sites?${query}&select=site_id,site_name,group_id,user_id,seen_status,seen_date,geometry,users(username)`;
  }

  async getSitesByGroup(groupId: number): Promise<Site[]> {
    interface SiteWithUsers {
      site_id: number;
      site_name: string;
      group_id: number;
      user_id: number;
      seen_status: string;
      seen_date: string;
      geometry: string;
      users: { username: string };
    }
    const resp = await this.postgrest.get<SiteWithUsers>(
      `/sites?group_id=eq.${groupId}&select=site_id,site_name,group_id,user_id,seen_status,seen_date,geometry,users(username)`
    );
    return resp.data.map((s) => ({
      site_id: s.site_id,
      site_name: s.site_name,
      group_id: s.group_id,
      username: s.users.username,
      seen_status: s.seen_status as any,
      seen_date: new Date(s.seen_date),
      geometry: s.geometry,
    }));
  }

  async getSitesByName(groupName: string): Promise<Site[]> {
    const groupId = await this.getGroupId(groupName);
    return groupId ? this.getSitesByGroup(groupId) : [];
  }

  async getSitesWithFilters(
    groupName: string,
    filterRequest: any
  ): Promise<Site[]> {
    interface SiteWithUsers {
      site_id: number;
      site_name: string;
      group_id: number;
      user_id: number;
      seen_status: string;
      seen_date: string;
      geometry: string;
      users: { username: string };
    }
    const groupId = await this.getGroupId(groupName);
    if (!groupId) return [];
    let userId: number | null = null;
    if (filterRequest.username) {
      userId = await this.getUserId(filterRequest.username);
      if (!userId) return [];
    }
    const query = this.buildQuery(
      groupId,
      userId || undefined,
      filterRequest.seenStatuses
    );
    const resp = await this.postgrest.get<SiteWithUsers>(query);
    return resp.data.map((s) => ({
      site_id: s.site_id,
      site_name: s.site_name,
      group_id: s.group_id,
      username: s.users.username,
      seen_status: s.seen_status as any,
      seen_date: new Date(s.seen_date),
      geometry: s.geometry,
    }));
  }

  async getSiteByName(siteName: string): Promise<Site | null> {
    interface SiteWithUsers {
      site_id: number;
      site_name: string;
      group_id: number;
      user_id: number;
      seen_status: string;
      seen_date: string;
      geometry: string;
      users: { username: string };
    }
    const resp = await this.postgrest.get<SiteWithUsers>(
      `/sites?site_name=eq.${encodeURIComponent(
        siteName
      )}&select=site_id,site_name,group_id,user_id,seen_status,seen_date,geometry,users(username)&limit=1`
    );
    const s = resp.data?.[0];
    if (!s) return null;
    return {
      site_id: s.site_id,
      site_name: s.site_name,
      group_id: s.group_id,
      username: s.users.username,
      seen_status: s.seen_status as any,
      seen_date: new Date(s.seen_date),
      geometry: s.geometry,
    };
  }

  async updateStatus(siteName: string, status: SeenStatus): Promise<boolean> {
    try {
      const site = await this.getSiteByName(siteName);
      if (!site) return false;
      await this.postgrest.patch(`/sites?site_id=eq.${site.site_id}`, {
        seen_status: status,
      });
      return true;
    } catch (error) {
      logger.error("Failed to update site status", { siteName, error });
      throw error;
    }
  }
}

import type { Site, SeenStatus } from "@homevisit/common";
import type { IPostgRESTClient } from "../interfaces/IPostgRESTClient.ts";
import type { SiteWithUsers } from "../interfaces/SiteDTO.ts";
import { logger } from "../middleware/logger.ts";
import { mapToSite, mapToSites } from "../utils/siteMapper.ts";

const SITE_SELECT =
  "site_id,site_name,group_id,user_id,seen_status,seen_date,geometry,users(username,display_name)";

export class SiteService {
  constructor(private postgrest: IPostgRESTClient) {}

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
    userIds?: number[],
    seenStatuses?: string[]
  ): string {
    const filters = [`group_id=eq.${groupId}`];
    if (userIds?.length) {
      filters.push(`user_id=in.(${userIds.join(",")})`);
    }
    if (seenStatuses?.length) {
      filters.push(
        `seen_status=in.(${seenStatuses.map((s) => `"${s}"`).join(",")})`
      );
    }
    return `/sites?${filters.join("&")}&select=${SITE_SELECT}`;
  }

  async getSitesByGroup(groupId: number): Promise<Site[]> {
    const resp = await this.postgrest.get<SiteWithUsers>(
      `/sites?group_id=eq.${groupId}&select=${SITE_SELECT}`
    );
    return mapToSites(resp.data);
  }

  async getSitesByName(groupName: string): Promise<Site[]> {
    const groupId = await this.getGroupId(groupName);
    return groupId ? this.getSitesByGroup(groupId) : [];
  }

  async getSitesWithFilters(
    groupName: string,
    filterRequest: any
  ): Promise<Site[]> {
    const groupId = await this.getGroupId(groupName);
    if (!groupId) return [];

    let userIds: number[] | undefined;
    if (filterRequest.usernames?.length > 0) {
      userIds = [];
      for (const username of filterRequest.usernames) {
        const userId = await this.getUserId(username);
        if (userId) userIds.push(userId);
      }
      if (userIds.length === 0) return [];
    }

    const query = this.buildQuery(groupId, userIds, filterRequest.seenStatuses);
    const resp = await this.postgrest.get<SiteWithUsers>(query);
    return mapToSites(resp.data);
  }

  async getSiteByName(siteName: string): Promise<Site | null> {
    const resp = await this.postgrest.get<SiteWithUsers>(
      `/sites?site_name=eq.${encodeURIComponent(
        siteName
      )}&select=${SITE_SELECT}&limit=1`
    );
    const s = resp.data?.[0];
    return s ? mapToSite(s) : null;
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

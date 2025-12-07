import type { Site, SeenStatus } from "@homevisit/common";
import type { ISiteService } from "./interfaces/ISiteService.ts";
import type { IPostgRESTClient } from "../postgrest/interfaces/IPostgRESTClient.ts";
import type { SiteWithUsers } from "./SiteWithUsers.ts";
import { logger } from "../../middleware/logger.ts";
import { mapToSite, mapToSites } from "../../utils/siteMapper.ts";
import {
  buildSiteQuery,
  buildSiteByGroupQuery,
  buildSiteByNameQuery,
  buildSiteByIdQuery,
} from "./siteQueryBuilder.ts";

export class SiteService implements ISiteService {
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

  async getSitesByGroup(groupId: number): Promise<Site[]> {
    const resp = await this.postgrest.get<SiteWithUsers>(
      buildSiteByGroupQuery(groupId)
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

    const query = buildSiteQuery(groupId, userIds, filterRequest.seenStatuses);
    const resp = await this.postgrest.get<SiteWithUsers>(query);
    return mapToSites(resp.data);
  }

  async getSiteByName(siteName: string): Promise<Site | null> {
    const resp = await this.postgrest.get<SiteWithUsers>(
      buildSiteByNameQuery(siteName)
    );
    return resp.data?.[0] ? mapToSite(resp.data[0]) : null;
  }

  async getSiteById(siteId: number): Promise<Site | null> {
    const resp = await this.postgrest.get<SiteWithUsers>(
      buildSiteByIdQuery(siteId)
    );
    return resp.data?.[0] ? mapToSite(resp.data[0]) : null;
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

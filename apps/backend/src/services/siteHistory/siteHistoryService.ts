/**
 * Site History Service - Handles site history database operations
 */
import type { SeenStatus, SiteHistory } from "@homevisit/common";
import type { ISiteHistoryService } from "./interfaces/ISiteHistoryService.ts";
import type { IPostgRESTClient } from "../postgrest/interfaces/IPostgRESTClient.ts";
import { logger } from "../../middleware/logger.ts";

export class SiteHistoryService implements ISiteHistoryService {
  constructor(private postgrest: IPostgRESTClient) {}

  async getSiteHistoryByNameAndGroup(
    siteName: string,
    groupName: string
  ): Promise<SiteHistory[]> {
    try {
      const resp = await this.postgrest.post<SiteHistory[]>(
        "/rpc/get_site_history_by_name_and_group",
        { p_site_name: siteName, p_group_name: groupName }
      );
      return (resp.data || []).map((r: any) => ({
        ...r,
        recorded_date: new Date(r.recorded_date),
      }));
    } catch (error) {
      logger.error("Failed to get site history", {
        siteName,
        groupName,
        error,
      });
      throw error;
    }
  }

  async upsertSiteHistory(
    siteId: number,
    status: SeenStatus,
    date?: Date
  ): Promise<void> {
    try {
      const dateStr = (date ?? new Date()).toISOString().split("T")[0];
      await this.postgrest.post("/rpc/upsert_site_history", {
        p_site_id: siteId,
        p_status: status,
        p_date: dateStr,
      });
      logger.debug("Upserted site history", { siteId, status, date: dateStr });
    } catch (error) {
      logger.error("Failed to upsert site history", { siteId, status, error });
      throw error;
    }
  }

  async saveGroupStatusesToHistory(groupId: number): Promise<number> {
    try {
      const resp = await this.postgrest.post<number>(
        "/rpc/save_group_statuses_to_history",
        { p_group_id: groupId }
      );
      const count = typeof resp.data === "number" ? resp.data : 0;
      logger.info(`Saved ${count} statuses to history for group ${groupId}`);
      return count;
    } catch (error) {
      logger.error("Failed to save group statuses", { groupId, error });
      throw error;
    }
  }

  async updateSiteHistory(
    siteName: string,
    groupName: string,
    date: Date,
    newStatus: SeenStatus
  ): Promise<boolean> {
    try {
      const dateStr = date.toISOString().split("T")[0];
      const resp = await this.postgrest.post<boolean>(
        "/rpc/update_site_history",
        {
          p_site_name: siteName,
          p_group_name: groupName,
          p_date: dateStr,
          p_new_status: newStatus,
        }
      );
      const success = resp.data === true;
      if (success)
        logger.info("Updated site history", { siteName, groupName, newStatus });
      return success;
    } catch (error) {
      logger.error("Failed to update site history", {
        siteName,
        groupName,
        error,
      });
      throw error;
    }
  }
}

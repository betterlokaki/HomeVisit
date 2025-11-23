import type { Group } from "@homevisit/common";
import { PostgRESTClient } from "./postgrestClient.js";
import { logger } from "../middleware/logger.js";

/**
 * Group Service - Single Responsibility: Group data operations
 */
export class GroupService {
  constructor(private postgrest: PostgRESTClient) {}

  async getByName(name: string): Promise<Group | null> {
    try {
      const response = await this.postgrest.get<Group>(
        `/groups?group_name=eq.${encodeURIComponent(
          name
        )}&select=group_id,group_name,data_refreshments&limit=1`
      );
      return response.data?.[0] || null;
    } catch (error) {
      logger.error("Failed to get group by name", { name, error });
      throw error;
    }
  }

  async getById(id: number): Promise<Group | null> {
    try {
      const response = await this.postgrest.get<Group>(
        `/groups?group_id=eq.${id}&select=group_id,name,data_refreshments&limit=1`
      );
      return response.data?.[0] || null;
    } catch (error) {
      logger.error("Failed to get group by id", { id, error });
      throw error;
    }
  }

  async getAll(): Promise<Group[]> {
    try {
      const response = await this.postgrest.get<Group>(
        "/groups?select=group_id,group_name,data_refreshments"
      );
      return response.data || [];
    } catch (error) {
      logger.error("Failed to get all groups", error);
      throw error;
    }
  }

  async refreshExpiredStatuses(groupId: number): Promise<number> {
    try {
      logger.debug("Calling refresh_expired_statuses RPC", { groupId });
      const response = await this.postgrest.post<number>(
        "/rpc/refresh_expired_statuses",
        {
          p_group_id: groupId,
        }
      );
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
}

import type { Group } from "@homevisit/common";
import type { IGroupService } from "./interfaces/IGroupService.ts";
import type { IPostgRESTClient } from "../postgrest/interfaces/IPostgRESTClient.ts";
import { logger } from "../../middleware/logger.ts";

const GROUP_SELECT = "group_id,group_name,data_refreshments";

export class GroupService implements IGroupService {
  constructor(private postgrest: IPostgRESTClient) {}

  async getByName(name: string): Promise<Group | null> {
    try {
      const resp = await this.postgrest.get<Group>(
        `/groups?group_name=eq.${encodeURIComponent(
          name
        )}&select=${GROUP_SELECT}&limit=1`
      );
      return resp.data?.[0] || null;
    } catch (error) {
      logger.error("Failed to get group by name", { name, error });
      throw error;
    }
  }

  async getById(id: number): Promise<Group | null> {
    try {
      const resp = await this.postgrest.get<Group>(
        `/groups?group_id=eq.${id}&select=${GROUP_SELECT}&limit=1`
      );
      return resp.data?.[0] || null;
    } catch (error) {
      logger.error("Failed to get group by id", { id, error });
      throw error;
    }
  }

  async getAll(): Promise<Group[]> {
    try {
      const resp = await this.postgrest.get<Group>(
        `/groups?select=${GROUP_SELECT}`
      );
      return resp.data || [];
    } catch (error) {
      logger.error("Failed to get all groups", error);
      throw error;
    }
  }

  async refreshExpiredStatuses(groupId: number): Promise<number> {
    try {
      const resp = await this.postgrest.post<number>(
        "/rpc/refresh_expired_statuses",
        {
          p_group_id: groupId,
        }
      );
      return typeof resp.data === "number" ? resp.data : 0;
    } catch (error) {
      logger.error("Failed to refresh expired statuses", error);
      throw error;
    }
  }
}

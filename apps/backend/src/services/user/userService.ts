import type { User } from "@homevisit/common";
import type { IUserService } from "./interfaces/IUserService.ts";
import type { IPostgRESTClient } from "../postgrest/interfaces/IPostgRESTClient.ts";
import { logger } from "../../middleware/logger.ts";

/**
 * User Service
 * Single Responsibility: User data access and management
 */
export class UserService implements IUserService {
  constructor(private postgrest: IPostgRESTClient) {}

  async getOrCreateUser(groupId: number): Promise<number> {
    try {
      const response = await this.postgrest.get<User>(
        `/users?group_id=eq.${groupId}&select=user_id&limit=1`
      );
      if (response.data?.[0]) return (response.data[0] as any).user_id;
      throw new Error("User creation not implemented");
    } catch (error) {
      logger.error("Failed to get user", error);
      throw error;
    }
  }

  async getUserId(username: string): Promise<number | null> {
    try {
      const response = await this.postgrest.get<User>(
        `/users?username=eq.${encodeURIComponent(
          username
        )}&select=user_id&limit=1`
      );
      return (response.data?.[0] as any)?.user_id || null;
    } catch (error) {
      logger.error("Failed to get user id", { username, error });
      throw error;
    }
  }

  async getUsernameMap(groupId: number): Promise<Map<number, string>> {
    try {
      const response = await this.postgrest.get(
        `/users?group_id=eq.${groupId}&select=user_id,username`
      );
      return new Map(response.data.map((u: any) => [u.user_id, u.username]));
    } catch (error) {
      logger.error("Failed to get username map", { groupId, error });
      throw error;
    }
  }

  async getUsersByGroupName(groupName: string): Promise<User[]> {
    try {
      const groupId = await this.getGroupIdByName(groupName);
      if (!groupId) {
        logger.warn("Group not found", { groupName });
        return [];
      }
      return this.fetchUsersByGroupId(groupId);
    } catch (error) {
      logger.error("Failed to get users by group name", { groupName, error });
      throw error;
    }
  }

  private async getGroupIdByName(groupName: string): Promise<number | null> {
    const groupResponse = await this.postgrest.get<{ group_id: number }>(
      `/groups?group_name=eq.${encodeURIComponent(
        groupName
      )}&select=group_id&limit=1`
    );
    return groupResponse.data?.[0]?.group_id || null;
  }

  private async fetchUsersByGroupId(groupId: number): Promise<User[]> {
    const response = await this.postgrest.get<User>(
      `/users?group_id=eq.${groupId}&select=user_id,group_id,username,display_name`
    );
    return response.data || [];
  }
}

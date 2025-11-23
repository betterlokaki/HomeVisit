import type { User } from "@homevisit/common";
import { PostgRESTClient } from "./postgrestClient.js";
import { logger } from "../middleware/logger.js";

/**
 * User Service
 * Single Responsibility: User data access and management
 */
export class UserService {
  constructor(private postgrest: PostgRESTClient) {}

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
}

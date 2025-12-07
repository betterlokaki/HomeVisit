import type { User } from "@homevisit/common";

/**
 * Service for user data access and management
 */
export interface IUserService {
  getOrCreateUser(groupId: number): Promise<number>;
  getUserId(username: string): Promise<number | null>;
  getUsernameMap(groupId: number): Promise<Map<number, string>>;
  getUsersByGroupName(groupName: string): Promise<User[]>;
}

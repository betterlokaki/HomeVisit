/**
 * Interface for Group Service
 */

import type { Group } from "@homevisit/common";

export interface IGroupService {
  getAll(): Promise<Group[]>;
  getById(groupId: number): Promise<Group | null>;
  getByName(groupName: string): Promise<Group | null>;
  refreshExpiredStatuses(groupId: number): Promise<number>;
}

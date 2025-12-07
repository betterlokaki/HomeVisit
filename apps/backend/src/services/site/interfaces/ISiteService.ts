/**
 * Interface for Site Service
 */

import type { Site, SeenStatus } from "@homevisit/common";

export interface ISiteService {
  getSitesByGroup(groupId: number): Promise<Site[]>;
  getSitesByName(groupName: string): Promise<Site[]>;
  getSitesWithFilters(groupName: string, filterRequest: any): Promise<Site[]>;
  getSiteByName(siteName: string): Promise<Site | null>;
  getSiteById(siteId: number): Promise<Site | null>;
  updateStatus(siteName: string, status: SeenStatus): Promise<boolean>;
}

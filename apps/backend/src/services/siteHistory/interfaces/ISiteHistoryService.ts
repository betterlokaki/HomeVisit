/**
 * Interface for Site History Service
 */

import type { SeenStatus, SiteHistory } from "@homevisit/common";

export interface ISiteHistoryService {
  getSiteHistoryByNameAndGroup(
    siteName: string,
    groupName: string
  ): Promise<SiteHistory[]>;

  upsertSiteHistory(
    siteId: number,
    status: SeenStatus,
    date?: Date
  ): Promise<void>;

  saveGroupStatusesToHistory(groupId: number): Promise<number>;

  updateSiteHistory(
    siteName: string,
    groupName: string,
    date: Date,
    newStatus: SeenStatus
  ): Promise<boolean>;
}

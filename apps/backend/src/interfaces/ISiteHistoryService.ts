/**
 * Interface for Site History Service
 *
 * Defines the contract for site history operations.
 * Follows Interface Segregation Principle - only history-related operations.
 */

import type { SeenStatus, SiteHistory } from "@homevisit/common";

export interface ISiteHistoryService {
  /**
   * Get history records for a site by site name and group name
   */
  getSiteHistoryByNameAndGroup(
    siteName: string,
    groupName: string
  ): Promise<SiteHistory[]>;

  /**
   * Upsert a history record for a site on a specific date
   */
  upsertSiteHistory(
    siteId: number,
    status: SeenStatus,
    date?: Date
  ): Promise<void>;

  /**
   * Save current status of all sites in a group to history
   * Returns the number of records saved
   */
  saveGroupStatusesToHistory(groupId: number): Promise<number>;

  /**
   * Update a specific history record by site name, group name, and date
   */
  updateSiteHistory(
    siteName: string,
    groupName: string,
    date: Date,
    newStatus: SeenStatus
  ): Promise<boolean>;
}

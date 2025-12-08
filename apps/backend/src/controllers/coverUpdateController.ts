/**
 * Cover Update Controller - Handles cover update history requests
 * Single Responsibility: Orchestrate cover update + visit history merge
 */

import type { Request, Response } from "express";
import type { MergedHistoryResponse } from "@homevisit/common";
import type { ICoverUpdateService } from "../services/coverUpdate/interfaces/ICoverUpdateService.ts";
import type { IHistoryMergeService } from "../services/historyMerge/interfaces/IHistoryMergeService.ts";
import type { ISiteHistoryService } from "../services/siteHistory/interfaces/ISiteHistoryService.ts";
import type { IGroupService } from "../services/group/interfaces/IGroupService.ts";
import type { ISiteService } from "../services/site/interfaces/ISiteService.ts";
import type { ICacheService } from "../services/cache/interfaces/ICacheService.ts";
import { sendSuccess, sendError } from "../utils/responseHelper.ts";
import { logger } from "../middleware/logger.ts";

export class CoverUpdateController {
  constructor(
    private coverUpdateService: ICoverUpdateService,
    private historyMergeService: IHistoryMergeService,
    private siteHistoryService: ISiteHistoryService,
    private groupService: IGroupService,
    private siteService: ISiteService,
    private cacheService: ICacheService<MergedHistoryResponse>
  ) {}

  /**
   * Build cache key from site name and group name
   */
  private buildCacheKey(siteName: string, groupName: string): string {
    return `${siteName}_${groupName}`;
  }

  /**
   * Get merged cover update and visit history for a site
   * POST /cover-update
   */
  async getMergedHistory(req: Request, res: Response): Promise<void> {
    try {
      const { siteId, groupId } = req.body;

      if (!siteId || !groupId) {
        sendError(res, "siteId and groupId are required", 400);
        return;
      }

      const site = await this.siteService.getSiteById(siteId);
      if (!site) {
        sendError(res, "Site not found", 404);
        return;
      }

      const group = await this.groupService.getById(groupId);
      if (!group) {
        sendError(res, "Group not found", 404);
        return;
      }

      // Check cache first
      const cacheKey = this.buildCacheKey(site.site_name, group.group_name);
      const cachedResponse = this.cacheService.get(cacheKey);
      if (cachedResponse) {
        logger.info("Returning cached merged history", {
          siteId,
          groupId,
          cacheKey,
        });
        sendSuccess(res, cachedResponse);
        return;
      }

      logger.info("Fetching cover updates", {
        siteId,
        groupId,
        geometry: site.geometry.substring(0, 50) + "...",
        refreshTimeMs: group.data_refreshments,
      });

      const coverUpdates = await this.coverUpdateService.getCoverUpdates(
        site.geometry,
        group.data_refreshments
      );

      const visitHistory =
        await this.siteHistoryService.getSiteHistoryByNameAndGroup(
          site.site_name,
          group.group_name
        );

      const mergedHistory = this.historyMergeService.mergeHistory(
        coverUpdates,
        visitHistory
      );

      const response: MergedHistoryResponse = {
        siteId: site.site_id,
        siteName: site.site_name,
        history: mergedHistory,
      };

      // Store in cache
      this.cacheService.set(cacheKey, response);

      logger.info("Successfully fetched merged history", {
        siteId,
        groupId,
        coverUpdatesCount: coverUpdates.length,
        visitHistoryCount: visitHistory.length,
        mergedCount: mergedHistory.length,
      });

      sendSuccess(res, response);
    } catch (error) {
      logger.error("Failed to get merged history", { error });
      sendError(res, "Failed to get merged history", 500, error);
    }
  }
}

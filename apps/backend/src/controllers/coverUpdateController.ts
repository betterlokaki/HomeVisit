/**
 * Cover Update Controller - Handles cover update history requests
 * Single Responsibility: Orchestrate cover update + visit history merge
 */

import type { Request, Response } from "express";
import type { MergedHistoryResponse } from "@homevisit/common";
import type { IPostgRESTClient } from "../interfaces/IPostgRESTClient.ts";
import { CoverUpdateService } from "../services/coverUpdateService.ts";
import { HistoryMergeService } from "../services/historyMergeService.ts";
import { SiteHistoryService } from "../services/siteHistoryService.ts";
import { GroupService } from "../services/groupService.ts";
import { SiteService } from "../services/siteService.ts";
import { sendSuccess, sendError } from "../utils/responseHelper.ts";
import { logger } from "../middleware/logger.ts";

export class CoverUpdateController {
  private coverUpdateService: CoverUpdateService;
  private historyMergeService: HistoryMergeService;
  private siteHistoryService: SiteHistoryService;
  private groupService: GroupService;
  private siteService: SiteService;

  constructor(postgrest: IPostgRESTClient) {
    this.coverUpdateService = new CoverUpdateService();
    this.historyMergeService = new HistoryMergeService();
    this.siteHistoryService = new SiteHistoryService(postgrest);
    this.groupService = new GroupService(postgrest);
    this.siteService = new SiteService(postgrest);
  }

  /**
   * Get merged cover update and visit history for a site
   * POST /cover-update
   * Body: { siteId: number, groupId: number }
   */
  async getMergedHistory(req: Request, res: Response): Promise<void> {
    try {
      const { siteId, groupId } = req.body;

      // Validate required fields
      if (!siteId || !groupId) {
        sendError(res, "siteId and groupId are required", 400);
        return;
      }

      // Get site info
      const site = await this.siteService.getSiteById(siteId);
      if (!site) {
        sendError(res, "Site not found", 404);
        return;
      }

      // Get group info for refresh time
      const group = await this.groupService.getById(groupId);
      if (!group) {
        sendError(res, "Group not found", 404);
        return;
      }

      logger.info("Fetching cover updates", {
        siteId,
        groupId,
        geometry: site.geometry.substring(0, 50) + "...",
        refreshTimeMs: group.data_refreshments,
        refreshTimeSeconds: Math.floor(group.data_refreshments / 1000),
      });

      // Fetch cover updates from external service
      const coverUpdates = await this.coverUpdateService.getCoverUpdates(
        site.geometry,
        group.data_refreshments
      );

      // Fetch visit history from database
      const visitHistory =
        await this.siteHistoryService.getSiteHistoryByNameAndGroup(
          site.site_name,
          group.group_name
        );

      // Merge cover updates with visit history
      const mergedHistory = this.historyMergeService.mergeHistory(
        coverUpdates,
        visitHistory
      );

      const response: MergedHistoryResponse = {
        siteId: site.site_id,
        siteName: site.site_name,
        history: mergedHistory,
      };

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

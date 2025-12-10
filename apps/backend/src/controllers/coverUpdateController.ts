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
import { toDateKey } from "../services/historyMerge/dateKeyHelper.ts";

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
        // Log what we're returning from cache to verify it's correct
        const dec9Cached = cachedResponse.history?.find(
          (e: any) => toDateKey(e.date) === "2025-12-09"
        );
        logger.info("Returning cached merged history", {
          siteId,
          groupId,
          cacheKey,
          cacheEntryCount: cachedResponse.history?.length || 0,
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

      // Force a fresh query by adding a timestamp parameter to bust any caches
      // Also add delay to ensure database transaction is committed
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Fetch visit history - this should get fresh data from database
      const visitHistory =
        await this.siteHistoryService.getSiteHistoryByNameAndGroup(
          site.site_name,
          group.group_name
        );

      // Log to verify we're getting the correct data
      const dec9Entry = visitHistory.find(
        (v) => toDateKey(v.recorded_date) === "2025-12-09"
      );
      if (dec9Entry) {
        logger.info("✅ Visit history for 2025-12-09 BEFORE merge", {
          siteName: site.site_name,
          status: dec9Entry.status,
          recorded_date: dec9Entry.recorded_date,
          history_id: (dec9Entry as any).history_id,
        });
      } else {
        logger.warn("❌ No visit history entry found for 2025-12-09", {
          siteName: site.site_name,
          allDates: visitHistory
            .map((v) => toDateKey(v.recorded_date))
            .slice(-5),
        });
      }

      // Log ALL visit history entries for debugging
      logger.info("Visit history fetched for merge", {
        siteName: site.site_name,
        groupName: group.group_name,
        visitHistoryCount: visitHistory.length,
        dec9Entries: visitHistory
          .filter((v) => toDateKey(v.recorded_date) === "2025-12-09")
          .map((v) => ({
            recorded_date: v.recorded_date,
            status: v.status,
            dateKey: toDateKey(v.recorded_date),
          })),
        allRecentEntries: visitHistory.slice(-5).map((v) => ({
          recorded_date: v.recorded_date,
          status: v.status,
          dateKey: toDateKey(v.recorded_date),
        })),
      });

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

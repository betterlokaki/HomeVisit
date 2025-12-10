/**
 * History Preload Scheduler
 * Pre-loads history for all groups and sites on startup
 */

import type { IGroupService } from "../group/interfaces/IGroupService.ts";
import type { ISiteService } from "../site/interfaces/ISiteService.ts";
import type { ICoverUpdateService } from "../coverUpdate/interfaces/ICoverUpdateService.ts";
import type { IHistoryMergeService } from "../historyMerge/interfaces/IHistoryMergeService.ts";
import type { ISiteHistoryService } from "../siteHistory/interfaces/ISiteHistoryService.ts";
import type { ICacheService } from "../cache/interfaces/ICacheService.ts";
import type { MergedHistoryResponse } from "@homevisit/common";
import { logger } from "../../middleware/logger.ts";

export class HistoryPreloadScheduler {
  private isRunning = false;

  constructor(
    private groupService: IGroupService,
    private siteService: ISiteService,
    private coverUpdateService: ICoverUpdateService,
    private historyMergeService: IHistoryMergeService,
    private siteHistoryService: ISiteHistoryService,
    private cacheService: ICacheService<MergedHistoryResponse>
  ) {}

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("History preload scheduler is already running");
      return;
    }

    this.isRunning = true;
    logger.info("🚀 Starting History Preload Scheduler");

    // Run preload in background (don't block server startup)
    this.preloadAllHistory().catch((error) => {
      logger.error("Failed to preload history", error);
    });
  }

  stop(): void {
    if (!this.isRunning) return;
    logger.info("⏸️ Stopping History Preload Scheduler");
    this.isRunning = false;
  }

  private async preloadAllHistory(): Promise<void> {
    logger.info("🔄 Preloading history for all groups and sites");

    try {
      const groups = await this.groupService.getAll();
      logger.info(`Found ${groups.length} groups to preload history`);

      for (const group of groups) {
        try {
          await this.preloadGroupHistory(group.group_id, group.group_name);
        } catch (error) {
          // Catch at orchestration level: one group failing shouldn't stop others
          logger.error(
            `Failed to preload history for group: ${group.group_name}`,
            error
          );
        }
      }

      logger.info("✅ History preload completed");
    } catch (error) {
      logger.error("Failed to preload history", error);
    }
  }

  private async preloadGroupHistory(
    groupId: number,
    groupName: string
  ): Promise<void> {
    logger.info(`📦 Preloading history for group: ${groupName}`);

    const sites = await this.siteService.getSitesByGroup(groupId);

    if (sites.length === 0) {
      logger.info(`No sites found for group: ${groupName}`);
      return;
    }

    const group = await this.groupService.getById(groupId);
    if (!group) {
      throw new Error(`Group not found: ${groupName}`);
    }

    // Preload history for each site in parallel (with concurrency limit)
    const BATCH_SIZE = 10;
    for (let i = 0; i < sites.length; i += BATCH_SIZE) {
      const batch = sites.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((site) =>
          this.preloadSiteHistory(
            site.site_id,
            site.site_name,
            groupName,
            group.data_refreshments
          )
        )
      );
    }

    logger.info(
      `✅ Preloaded history for ${sites.length} sites in group: ${groupName}`
    );
  }

  private async preloadSiteHistory(
    siteId: number,
    siteName: string,
    groupName: string,
    refreshTimeMs: number
  ): Promise<void> {
    try {
      // Check cache first
      const cacheKey = `${siteName}_${groupName}`;
      if (this.cacheService.get(cacheKey)) {
        return; // Already cached
      }

      // Get site to get geometry
      const site = await this.siteService.getSiteById(siteId);
      if (!site) {
        logger.warn(`Site not found: ${siteId}`);
        return;
      }

      // Fetch cover updates
      const coverUpdates = await this.coverUpdateService.getCoverUpdates(
        site.geometry,
        refreshTimeMs
      );

      // Fetch visit history
      const visitHistory =
        await this.siteHistoryService.getSiteHistoryByNameAndGroup(
          siteName,
          groupName
        );

      // Merge history
      const mergedHistory = this.historyMergeService.mergeHistory(
        coverUpdates,
        visitHistory
      );

      // Store in cache
      const response: MergedHistoryResponse = {
        siteId,
        siteName,
        history: mergedHistory,
      };

      this.cacheService.set(cacheKey, response);
    } catch (error) {
      // Log but don't throw - one site failing shouldn't stop others
      logger.error(
        `Failed to preload history for site: ${siteName} (${siteId})`,
        error
      );
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
    };
  }
}

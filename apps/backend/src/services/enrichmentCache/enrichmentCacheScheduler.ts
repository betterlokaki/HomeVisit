/**
 * Enrichment Cache Scheduler
 * Manages periodic refresh of enrichment cache for all groups
 */

import type { IGroupService } from "../group/interfaces/IGroupService.ts";
import type { ISiteService } from "../site/interfaces/ISiteService.ts";
import type { IEnrichmentService } from "../enrichment/interfaces/IEnrichmentService.ts";
import type { IEnrichmentCacheService } from "./interfaces/IEnrichmentCacheService.ts";
import type {
  CachedGroupEnrichment,
  CachedSiteEnrichmentItem,
} from "@homevisit/common";
import { logger } from "../../middleware/logger.ts";
import { getEnrichmentConfig } from "../../config/enrichmentConfig.ts";

export class EnrichmentCacheScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private refreshIntervalMs: number;

  constructor(
    private groupService: IGroupService,
    private siteService: ISiteService,
    private enrichmentService: IEnrichmentService,
    private cacheService: IEnrichmentCacheService
  ) {
    const config = getEnrichmentConfig();
    this.refreshIntervalMs =
      config.enrichmentService.cacheRefreshIntervalMinutes * 60 * 1000;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Enrichment cache scheduler is already running");
      return;
    }

    this.isRunning = true;
    logger.info("🚀 Starting Enrichment Cache Scheduler", {
      refreshIntervalMinutes:
        getEnrichmentConfig().enrichmentService.cacheRefreshIntervalMinutes,
    });

    await this.refreshAllGroups();

    this.intervalId = setInterval(async () => {
      await this.refreshAllGroups();
    }, this.refreshIntervalMs);
  }

  stop(): void {
    if (!this.isRunning) return;

    logger.info("⏸️ Stopping Enrichment Cache Scheduler");
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async refreshAllGroups(): Promise<void> {
    logger.info("🔄 Refreshing enrichment cache for all groups");

    const groups = await this.groupService.getAll();
    logger.info(`Found ${groups.length} groups to refresh`);

    for (const group of groups) {
      try {
        await this.refreshGroup(group.group_name, group.group_id);
      } catch (error) {
        // Catch at orchestration level: one group failing shouldn't stop others
        logger.error(
          `Failed to refresh cache for group: ${group.group_name}`,
          error
        );
      }
    }

    logger.info("✅ Enrichment cache refresh completed", {
      stats: this.cacheService.getStats(),
    });
  }

  private async refreshGroup(
    groupName: string,
    groupId: number
  ): Promise<void> {
    logger.info(`📦 Refreshing cache for group: ${groupName}`);

    const [sites, group] = await Promise.all([
      this.siteService.getSitesByGroup(groupId),
      this.groupService.getById(groupId),
    ]);

    if (!group) {
      throw new Error(`Group not found: ${groupName}`);
    }

    if (sites.length === 0) {
      logger.info(`No sites found for group: ${groupName}`);
      return;
    }

    const enrichedSites = await this.enrichmentService.enrichSites(
      sites,
      group
    );

    const siteEnrichments = new Map<string, CachedSiteEnrichmentItem>();
    for (const site of enrichedSites) {
      siteEnrichments.set(site.site_name, {
        status: site.updatedStatus,
        projectLink: site.siteLink,
      });
    }

    const cacheData: CachedGroupEnrichment = {
      siteEnrichments,
      lastUpdated: new Date(),
    };

    this.cacheService.set(groupName, cacheData);
    logger.info(
      `✅ Cached ${enrichedSites.length} sites for group: ${groupName}`
    );
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      stats: this.cacheService.getStats(),
    };
  }
}

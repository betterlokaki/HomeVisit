/**
 * Status Refresh Scheduler Service
 * Manages periodic refresh of site statuses based on group refresh intervals.
 */

import { logger } from "../middleware/logger.ts";
import { GroupService } from "./group/groupService.ts";
import { PostgRESTClient } from "./postgrest/postgrestClient.ts";
import { SiteHistoryService } from "./siteHistory/siteHistoryService.ts";
import type { ISiteHistoryService } from "./siteHistory/interfaces/ISiteHistoryService.ts";
import type { IPostgRESTClient } from "./postgrest/interfaces/IPostgRESTClient.ts";
import type { IGroupService } from "./group/interfaces/IGroupService.ts";

interface ScheduledGroup {
  groupId: number;
  refreshInterval: number;
  timeoutId: NodeJS.Timeout;
}

export class StatusRefreshScheduler {
  private scheduledGroups: Map<number, ScheduledGroup> = new Map();
  private isRunning = false;

  constructor(
    private groupService: IGroupService,
    private siteHistoryService: ISiteHistoryService
  ) {}

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Status refresh scheduler is already running");
      return;
    }
    try {
      this.isRunning = true;
      logger.info("🔄 Starting Status Refresh Scheduler");
      await this.initializeGroupSchedules();
    } catch (error) {
      logger.error("Failed to start Status Refresh Scheduler", error);
      this.isRunning = false;
      throw error;
    }
  }

  stop(): void {
    if (!this.isRunning) return;
    logger.info("⏸️ Stopping Status Refresh Scheduler");
    this.scheduledGroups.forEach((group) => clearInterval(group.timeoutId));
    this.scheduledGroups.clear();
    this.isRunning = false;
  }

  private async initializeGroupSchedules(): Promise<void> {
    const groups = await this.groupService.getAll();
    logger.info("Initializing refresh schedules", { count: groups.length });
    groups.forEach((group) =>
      this.scheduleGroupRefresh(group.group_id, group.data_refreshments)
    );
  }

  private scheduleGroupRefresh(groupId: number, refreshInterval: number): void {
    const existing = this.scheduledGroups.get(groupId);
    if (existing) clearInterval(existing.timeoutId);

    const checkInterval = Math.max(refreshInterval / 30, 1000);
    logger.info(`📅 Scheduling refresh for group ${groupId}`, {
      refreshInterval,
      checkInterval,
    });

    const timeoutId = setInterval(
      () => this.refreshGroupStatuses(groupId),
      checkInterval
    );
    this.refreshGroupStatuses(groupId).catch((e) =>
      logger.error(`Refresh failed for ${groupId}`, e)
    );
    this.scheduledGroups.set(groupId, { groupId, refreshInterval, timeoutId });
  }

  private async refreshGroupStatuses(groupId: number): Promise<void> {
    try {
      const saved = await this.siteHistoryService.saveGroupStatusesToHistory(
        groupId
      );
      if (saved > 0)
        logger.info(
          `📝 Saved ${saved} status(es) to history for group ${groupId}`
        );

      const refreshed = await this.groupService.refreshExpiredStatuses(groupId);
      if (refreshed > 0)
        logger.info(`✅ Refreshed ${refreshed} site(s) for group ${groupId}`);
    } catch (error) {
      logger.error(`Failed to refresh statuses for group ${groupId}`, error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      scheduledGroups: Array.from(this.scheduledGroups.values()).map((g) => ({
        groupId: g.groupId,
        refreshInterval: g.refreshInterval,
      })),
    };
  }
}

function createStatusRefreshScheduler(): StatusRefreshScheduler {
  const postgrest = new PostgRESTClient();
  const groupService = new GroupService(postgrest);
  const siteHistoryService = new SiteHistoryService(postgrest);
  return new StatusRefreshScheduler(groupService, siteHistoryService);
}

export const statusRefreshScheduler = createStatusRefreshScheduler();

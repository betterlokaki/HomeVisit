/**
 * Status Refresh Scheduler Service
 * Manages periodic refresh of site statuses based on group refresh intervals.
 */

import { logger } from "../middleware/logger.ts";
import { GroupService } from "./groupService.ts";
import { PostgRESTClient } from "./postgrestClient.ts";
import { SiteHistoryService } from "./siteHistoryService.ts";
import type { ISiteHistoryService } from "../interfaces/ISiteHistoryService.ts";
import type { IPostgRESTClient } from "../interfaces/IPostgRESTClient.ts";

interface ScheduledGroup {
  groupId: number;
  refreshInterval: number;
  timeoutId: NodeJS.Timeout;
}

export class StatusRefreshScheduler {
  private scheduledGroups: Map<number, ScheduledGroup> = new Map();
  private isRunning = false;
  private groupService: GroupService;
  private siteHistoryService: ISiteHistoryService;

  constructor(
    postgrest: IPostgRESTClient,
    siteHistoryService: ISiteHistoryService
  ) {
    this.groupService = new GroupService(postgrest);
    this.siteHistoryService = siteHistoryService;
  }

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
  return new StatusRefreshScheduler(
    postgrest,
    new SiteHistoryService(postgrest)
  );
}

export const statusRefreshScheduler = createStatusRefreshScheduler();

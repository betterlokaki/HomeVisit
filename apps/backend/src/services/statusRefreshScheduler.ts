/**
 * Status Refresh Scheduler Service
 *
 * Manages periodic refresh of site statuses based on group refresh intervals.
 * When a site's countdown expires, its status is reset to 'Not Seen'.
 */

import { logger } from "../middleware/logger.js";
import { postgrestService } from "./postgrestService.js";

interface ScheduledGroup {
  groupId: number;
  refreshInterval: number; // in milliseconds
  timeoutId: NodeJS.Timeout;
}

class StatusRefreshScheduler {
  private scheduledGroups: Map<number, ScheduledGroup> = new Map();
  private isRunning = false;

  /**
   * Start the status refresh scheduler
   * Initializes refresh timers for all groups
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Status refresh scheduler is already running");
      return;
    }

    try {
      this.isRunning = true;
      logger.info("🔄 Starting Status Refresh Scheduler");

      // Get all groups from database and schedule their refresh timers
      await this.initializeGroupSchedules();
    } catch (error) {
      logger.error("Failed to start Status Refresh Scheduler", error);
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Stop the status refresh scheduler
   * Clears all pending timers
   */
  stop(): void {
    if (!this.isRunning) {
      logger.warn("Status refresh scheduler is not running");
      return;
    }

    logger.info("⏸️ Stopping Status Refresh Scheduler");

    this.scheduledGroups.forEach((group) => {
      clearInterval(group.timeoutId);
    });

    this.scheduledGroups.clear();
    this.isRunning = false;
  }

  /**
   * Initialize refresh schedules for all groups
   * Fetches groups from database and sets up periodic refresh timers
   */
  private async initializeGroupSchedules(): Promise<void> {
    try {
      // Fetch all groups with their refresh intervals
      const groups = await postgrestService.getAllGroups();

      logger.info("Initializing refresh schedules for groups", {
        count: groups.length,
      });

      groups.forEach((group) => {
        this.scheduleGroupRefresh(group.group_id, group.data_refreshments);
      });
    } catch (error) {
      logger.error("Failed to initialize group schedules", error);
      throw error;
    }
  }

  /**
   * Schedule a refresh timer for a specific group
   *
   * @param groupId - The group ID to schedule
   * @param refreshInterval - The refresh interval in milliseconds
   */
  private scheduleGroupRefresh(groupId: number, refreshInterval: number): void {
    // Clear existing timer if it exists
    const existingGroup = this.scheduledGroups.get(groupId);
    if (existingGroup) {
      clearInterval(existingGroup.timeoutId);
    }

    // Create a new timer that runs the refresh check at regular intervals
    // We check more frequently than the refresh interval to ensure timely updates
    // For example, if refresh is 30 minutes, we check every 1 minute
    const checkInterval = Math.max(refreshInterval / 30, 1000); // At least 1 second apart

    logger.info(
      `📅 Scheduling refresh for group ${groupId} (interval: ${refreshInterval}ms, check every: ${checkInterval}ms)`
    );

    const timeoutId = setInterval(async () => {
      await this.refreshGroupStatuses(groupId);
    }, checkInterval);

    // Also run the refresh immediately on startup
    this.refreshGroupStatuses(groupId).catch((error) => {
      logger.error(`Failed to refresh statuses for group ${groupId}`, error);
    });

    this.scheduledGroups.set(groupId, {
      groupId,
      refreshInterval,
      timeoutId,
    });
  }

  /**
   * Execute the refresh for a specific group
   * Calls the database function to reset expired site statuses
   *
   * @param groupId - The group ID to refresh
   */
  private async refreshGroupStatuses(groupId: number): Promise<void> {
    try {
      const refreshedCount = await postgrestService.refreshExpiredStatuses(
        groupId
      );

      if (refreshedCount > 0) {
        logger.info(
          `✅ Refreshed ${refreshedCount} site(s) for group ${groupId}`
        );
      }
    } catch (error) {
      logger.error(`Failed to refresh statuses for group ${groupId}`, error);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    scheduledGroups: Array<{
      groupId: number;
      refreshInterval: number;
    }>;
  } {
    return {
      isRunning: this.isRunning,
      scheduledGroups: Array.from(this.scheduledGroups.values()).map(
        (group) => ({
          groupId: group.groupId,
          refreshInterval: group.refreshInterval,
        })
      ),
    };
  }
}

// Export singleton instance
export const statusRefreshScheduler = new StatusRefreshScheduler();

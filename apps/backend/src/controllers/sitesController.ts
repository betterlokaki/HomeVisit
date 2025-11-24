import { Request, Response } from "express";
import { PostgRESTClient } from "../services/postgrestClient.js";
import { SiteService } from "../services/siteService.js";
import { GroupService } from "../services/groupService.js";
import { EnrichmentService } from "../services/enrichmentService.js";
import { FilterService } from "../services/filterService.js";
import { UserService } from "../services/userService.js";
import type { FilterRequest } from "@homevisit/common";
import {
  sendError,
  sendValidationError,
  sendSuccess,
  sendNotFound,
} from "../utils/responseHelper.js";
import { logger } from "../middleware/logger.js";

class SitesController {
  private siteService: SiteService;
  private groupService: GroupService;
  private enrichmentService: EnrichmentService;
  private filterService: FilterService;
  private userService: UserService;

  constructor() {
    const postgrest = new PostgRESTClient();
    this.siteService = new SiteService(postgrest);
    this.groupService = new GroupService(postgrest);
    this.enrichmentService = new EnrichmentService(postgrest);
    this.filterService = new FilterService();
    this.userService = new UserService(postgrest);
  }

  async getSites(req: Request, res: Response): Promise<void> {
    try {
      const groupName = req.query.group as string;
      if (!groupName) {
        sendValidationError(res, "Missing required parameter: group");
        return;
      }
      const sites = await this.siteService.getSitesByName(groupName);
      const group = await this.groupService.getByName(groupName);
      const enriched = await this.enrichmentService.enrichSites(sites, group);
      logger.info("Sites fetched", { groupName, count: sites.length });
      sendSuccess(res, enriched);
    } catch (error) {
      sendError(res, "Failed to fetch sites", 500, error);
    }
  }

  async filterSites(req: Request, res: Response): Promise<void> {
    try {
      const groupName = req.query.group as string;
      if (!groupName) {
        sendValidationError(res, "Missing required parameter: group");
        return;
      }
      const filterRequest: FilterRequest = req.body;
      logger.debug("Filter request", { groupName, filters: filterRequest });
      const sites = await this.siteService.getSitesWithFilters(
        groupName,
        filterRequest
      );
      logger.debug("Filtered sites count", { count: sites.length });
      const group = await this.groupService.getByName(groupName);
      if (!group) {
        logger.error("Group not found", { groupName });
        sendError(res, "Group not found", 404, null);
        return;
      }
      const enriched = await this.enrichmentService.enrichSites(sites, group);
      const filtered = this.filterService.applyRuntimeFilters(
        enriched,
        filterRequest
      );
      logger.info("Sites filtered", { groupName, count: filtered.length });
      sendSuccess(res, filtered);
    } catch (error) {
      logger.error("Filter error", { error });
      sendError(res, "Failed to filter sites", 500, error);
    }
  }

  async updateSiteStatus(req: Request, res: Response): Promise<void> {
    try {
      const { siteName } = req.params;
      const { status } = req.body;
      if (!siteName || !status) {
        sendValidationError(res, "Missing required fields");
        return;
      }
      const validStatuses = ["Seen", "Partial", "Not Seen"];
      if (!validStatuses.includes(status)) {
        sendValidationError(
          res,
          `Invalid status. Must be: ${validStatuses.join(", ")}`
        );
        return;
      }
      const updated = await this.siteService.updateStatus(siteName, status);
      if (!updated) {
        sendNotFound(res, `Site ${siteName}`);
        return;
      }
      logger.info("Site status updated", { siteName, status });
      sendSuccess(res, { message: "Site status updated successfully" });
    } catch (error) {
      sendError(res, "Failed to update site status", 500, error);
    }
  }

  async getGroupUsers(req: Request, res: Response): Promise<void> {
    try {
      const groupName = req.query.group as string;
      if (!groupName) {
        sendValidationError(res, "Missing required parameter: group");
        return;
      }
      const users = await this.userService.getUsersByGroupName(groupName);
      logger.info("Group users fetched", { groupName, count: users.length });
      sendSuccess(res, { users });
    } catch (error) {
      sendError(res, "Failed to fetch group users", 500, error);
    }
  }

  async getAllGroups(req: Request, res: Response): Promise<void> {
    try {
      const groups = await this.groupService.getAll();
      logger.info("All groups fetched", { count: groups.length });
      sendSuccess(res, { groups });
    } catch (error) {
      sendError(res, "Failed to fetch groups", 500, error);
    }
  }
}

export const sitesController = new SitesController();

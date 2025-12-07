import { Request, Response } from "express";
import type { ISiteService } from "../services/site/interfaces/ISiteService.ts";
import type { IGroupService } from "../services/group/interfaces/IGroupService.ts";
import type { IEnrichmentService } from "../services/enrichment/interfaces/IEnrichmentService.ts";
import type { IFilterService } from "../services/filter/interfaces/IFilterService.ts";
import type { FilterRequest } from "@homevisit/common";
import {
  sendError,
  sendValidationError,
  sendSuccess,
  sendNotFound,
} from "../utils/responseHelper.ts";
import { logger } from "../middleware/logger.ts";

const VALID_STATUSES = ["Seen", "Partial", "Not Seen"];

/** Sites Controller - Site CRUD operations */
export class SitesController {
  constructor(
    private siteService: ISiteService,
    private groupService: IGroupService,
    private enrichmentService: IEnrichmentService,
    private filterService: IFilterService
  ) {}

  async getSites(req: Request, res: Response): Promise<void> {
    try {
      const groupName = req.query.group as string;
      if (!groupName)
        return sendValidationError(res, "Missing required parameter: group");

      const [sites, group] = await Promise.all([
        this.siteService.getSitesByName(groupName),
        this.groupService.getByName(groupName),
      ]);
      if (!group) return sendError(res, "Group not found", 404, null);

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
      if (!groupName)
        return sendValidationError(res, "Missing required parameter: group");

      const filterRequest: FilterRequest = req.body;
      const [sites, group] = await Promise.all([
        this.siteService.getSitesWithFilters(groupName, filterRequest),
        this.groupService.getByName(groupName),
      ]);
      if (!group) return sendError(res, "Group not found", 404, null);

      const enriched = await this.enrichmentService.enrichSites(sites, group);
      const filtered = this.filterService.applyRuntimeFilters(
        enriched,
        filterRequest
      );
      logger.info("Sites filtered", { groupName, count: filtered.length });
      sendSuccess(res, filtered);
    } catch (error) {
      sendError(res, "Failed to filter sites", 500, error);
    }
  }

  async updateSiteStatus(req: Request, res: Response): Promise<void> {
    try {
      const { siteName } = req.params;
      const { status } = req.body;
      if (!siteName || !status)
        return sendValidationError(res, "Missing required fields");
      if (!VALID_STATUSES.includes(status))
        return sendValidationError(
          res,
          `Invalid status. Must be: ${VALID_STATUSES.join(", ")}`
        );

      const updated = await this.siteService.updateStatus(siteName, status);
      if (!updated) return sendNotFound(res, `Site ${siteName}`);

      logger.info("Site status updated", { siteName, status });
      sendSuccess(res, { message: "Site status updated successfully" });
    } catch (error) {
      sendError(res, "Failed to update site status", 500, error);
    }
  }
}

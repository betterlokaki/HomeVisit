/**
 * Site History Controller - Site history operations
 */
import { Request, Response } from "express";
import type { ISiteHistoryService } from "../interfaces/ISiteHistoryService.ts";
import type { SeenStatus } from "@homevisit/common";
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendNotFound,
} from "../utils/responseHelper.ts";
import { logger } from "../middleware/logger.ts";

const VALID_STATUSES = ["Seen", "Partial", "Not Seen"];

export class SiteHistoryController {
  constructor(private siteHistoryService: ISiteHistoryService) {}

  async getSiteHistory(req: Request, res: Response): Promise<void> {
    try {
      const siteName = req.query.site_name as string;
      const groupName = req.query.group_name as string;

      if (!siteName)
        return sendValidationError(
          res,
          "Missing required query parameter: site_name"
        );
      if (!groupName)
        return sendValidationError(
          res,
          "Missing required query parameter: group_name"
        );

      const history =
        await this.siteHistoryService.getSiteHistoryByNameAndGroup(
          siteName,
          groupName
        );
      logger.info("Site history fetched", {
        siteName,
        groupName,
        count: history.length,
      });
      sendSuccess(res, { history });
    } catch (error) {
      sendError(res, "Failed to fetch site history", 500, error);
    }
  }

  async updateSiteHistory(req: Request, res: Response): Promise<void> {
    try {
      const {
        site_name: siteName,
        group_name: groupName,
        date,
      } = req.query as Record<string, string>;
      const { status } = req.body;

      if (!siteName || !date)
        return sendValidationError(
          res,
          "Missing required query parameters: site_name and date"
        );
      if (!groupName)
        return sendValidationError(
          res,
          "Missing required query parameter: group_name"
        );
      if (!status)
        return sendValidationError(res, "Missing required field: status");
      if (!VALID_STATUSES.includes(status))
        return sendValidationError(
          res,
          `Invalid status. Must be: ${VALID_STATUSES.join(", ")}`
        );

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime()))
        return sendValidationError(res, "Invalid date format. Use YYYY-MM-DD");

      const updated = await this.siteHistoryService.updateSiteHistory(
        siteName,
        groupName,
        parsedDate,
        status as SeenStatus
      );
      if (!updated)
        return sendNotFound(
          res,
          `History record for site ${siteName} on ${date}`
        );

      logger.info("Site history updated", {
        siteName,
        groupName,
        date,
        status,
      });
      sendSuccess(res, { message: "Site history updated successfully" });
    } catch (error) {
      sendError(res, "Failed to update site history", 500, error);
    }
  }
}

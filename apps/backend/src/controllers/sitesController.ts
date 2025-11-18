/**
 * Sites Controller
 *
 * Handles sites endpoints logic.
 */

import { Request, Response } from "express";
import type { GetUserSitesResponse, EnrichedSite } from "@homevisit/common/src";
import { postgrestService } from "../services/postgrestService";
import { logger } from "../middleware/logger";
import {
  RESPONSE_SUCCESS_FIELD,
  RESPONSE_DATA_FIELD,
  ERROR_FIELD,
} from "../config/constants";
import { Site } from "@homevisit/common";

/**
 * GET /sites - Fetch sites by group with optional username and status filters
 * Query params:
 *   - group: string (required) - group name
 *   - username: string (optional) - username filter
 *   - status: string (optional) - seen_status filter (Seen, Partial, Not Seen)
 */
export async function getSites(req: Request, res: Response): Promise<void> {
  try {
    const groupName = req.query.group as string;

    if (!groupName) {
      res
        .status(400)
        .json({ [ERROR_FIELD]: "Missing required parameter: group" });
      return;
    }

    const username = req.query.username as string | undefined;
    const status = req.query.status as string | undefined;

    logger.info("GET /sites called", { groupName, username, status });

    const sites = await postgrestService.getSites(groupName, username, status);

    logger.info("Successfully fetched sites by group", {
      groupName,
      username,
      status,
      count: sites.length,
    });

    const response: any = {
      [RESPONSE_SUCCESS_FIELD]: true,
      [RESPONSE_DATA_FIELD]: {
        group: groupName,
        username: username || "all",
        status: status || "all",
        sites: sites,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error("Error in getSitesByGroup", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    res
      .status(500)
      .json({
        [ERROR_FIELD]: "Failed to fetch sites by group",
        details: error instanceof Error ? error.message : String(error),
      });
  }
}

/**
 * PUT /sites/:username/:siteName - Update a site's seen_status
 * Params:
 *   - username: string (required) - username
 *   - siteName: string (required) - site name
 * Body:
 *   - status: string (required) - new seen_status (Seen, Partial, Not Seen)
 */
export async function updateSiteStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { username, siteName } = req.params;
    const { status } = req.body;

    if (!username || !siteName || !status) {
      res.status(400).json({
        [ERROR_FIELD]:
          "Missing required parameters: username, siteName, and status",
      });
      return;
    }

    // Validate status is one of the allowed values
    const validStatuses = ["Seen", "Partial", "Not Seen"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        [ERROR_FIELD]: `Invalid status. Must be one of: ${validStatuses.join(
          ", "
        )}`,
      });
      return;
    }

    logger.info("PUT /sites/:username/:siteName called", {
      username,
      siteName,
      status,
    });

    const result = await postgrestService.updateSiteStatus(
      username,
      siteName,
      status
    );

    if (!result) {
      res.status(404).json({
        [ERROR_FIELD]: `Site not found for user ${username} with name ${siteName}`,
      });
      return;
    }

    logger.info("Successfully updated site status", {
      username,
      siteName,
      status,
    });

    res.json({
      [RESPONSE_SUCCESS_FIELD]: true,
      [RESPONSE_DATA_FIELD]: {
        message: `Site status updated successfully`,
        username,
        siteName,
        status,
      },
    });
  } catch (error) {
    logger.error("Error in updateSiteStatus", error);
    res.status(500).json({ [ERROR_FIELD]: "Failed to update site status" });
  }
}

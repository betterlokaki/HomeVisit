/**
 * Sites Controller
 *
 * Handles GET /userSites endpoint logic.
 */

import { Request, Response } from "express";
import type { GetUserSitesResponse, EnrichedSite } from "@homevisit/common/src";
import { postgrestService } from "../services/postgrestService.js";
import { calculateStatus, generateSiteLink } from "../utils/siteEnricher.js";
import { logger } from "../middleware/logger.js";
import {
  RESPONSE_SUCCESS_FIELD,
  RESPONSE_DATA_FIELD,
  ERROR_FIELD,
} from "../config/constants.js";

/**
 * GET /userSites - Fetch and enrich sites for user
 */
export async function getUserSites(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.query.user_id as string;

    if (!userId) {
      res
        .status(400)
        .json({ [ERROR_FIELD]: "Missing required parameter: user_id" });
      return;
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      res
        .status(400)
        .json({ [ERROR_FIELD]: "Invalid user_id: must be a number" });
      return;
    }

    logger.info("GET /userSites called", { userId: parsedUserId });

    const sites = await postgrestService.getUserSites(parsedUserId);
    const enrichedSites = await Promise.all(
      sites.map(async (site) => ({
        ...site,
        updatedStatus: await calculateStatus(),
        siteLink: generateSiteLink(),
      }))
    );

    logger.info("Successfully enriched sites", {
      userId: parsedUserId,
      count: enrichedSites.length,
    });

    const response: GetUserSitesResponse = {
      [RESPONSE_SUCCESS_FIELD]: true,
      [RESPONSE_DATA_FIELD]: { user_id: parsedUserId, sites: enrichedSites },
    };

    res.json(response);
  } catch (error) {
    logger.error("Error in getUserSites", error);
    res.status(500).json({ [ERROR_FIELD]: "Failed to fetch user sites" });
  }
}

/**
 * Controller for sites endpoints
 * Handles business logic for site-related requests
 */

import { Request, Response } from "express";
import { GetUserSitesResponse, EnrichedSite } from "@homevisit/common/src";
import { postgrestService } from "../services/postgrestService.js";
import { calculateStatus, generateSiteLink } from "../utils/siteEnricher.js";
import { logger } from "../middleware/logger.js";

/**
 * GET /userSites
 * Fetches all sites for a user and enriches them with:
 * - updatedStatus (calculated asynchronously)
 * - siteLink (randomly generated)
 */
export async function getUserSites(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.query.user_id as string;

    if (!userId) {
      res.status(400).json({
        error: "Missing required parameter: user_id",
      });
      return;
    }

    logger.info("GET /userSites called", { userId });

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      res.status(400).json({
        error: "Invalid user_id: must be a number",
      });
      return;
    }

    // Fetch sites from PostgREST
    const sites = await postgrestService.getUserSites(parsedUserId);

    // Enrich each site with updatedStatus and siteLink
    const enrichedSites = await Promise.all(
      sites.map(async (site) => {
        const [updatedStatus, siteLink] = await Promise.all([
          calculateStatus(),
          Promise.resolve(generateSiteLink()),
        ]);

        return {
          ...site,
          updatedStatus,
          siteLink,
        };
      })
    );

    logger.info("Successfully enriched sites", {
      userId,
      count: enrichedSites.length,
    });

    res.json({
      success: true,
      data: {
        user_id: parsedUserId,
        sites: enrichedSites,
      },
    });
  } catch (error) {
    logger.error("Error in getUserSites", error);
    res.status(500).json({
      error: "Failed to fetch user sites",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

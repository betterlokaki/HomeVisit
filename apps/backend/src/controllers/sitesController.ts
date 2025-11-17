/**
 * Sites Controller
 *
 * Handles sites endpoints logic.
 */

import { Request, Response } from "express";
import type { GetUserSitesResponse, EnrichedSite } from "@homevisit/common/src";
import { postgrestService } from "../services/postgrestService";
import { calculateStatus, createBarakLink } from "../utils/siteEnricher";
import { logger } from "../middleware/logger";
import {
  RESPONSE_SUCCESS_FIELD,
  RESPONSE_DATA_FIELD,
  ERROR_FIELD,
} from "../config/constants";

/**
 * GET /sites - Fetch sites by group with optional username and status filters
 * Query params:
 *   - group: string (required) - group name
 *   - username: string (optional) - username filter
 *   - status: string (optional) - seen_status filter (Seen, Partial, Not Seen)
 */
export async function getSitesByGroup(
  req: Request,
  res: Response
): Promise<void> {
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

    const enrichedSites = await Promise.all(
      sites.map(async (site: any) => ({
        ...site,
        updatedStatus: await calculateStatus(site, []),
        siteLink: createBarakLink(site, []),
      }))
    );

    logger.info("Successfully fetched and enriched sites by group", {
      groupName,
      username,
      status,
      count: enrichedSites.length,
    });

    const response: any = {
      [RESPONSE_SUCCESS_FIELD]: true,
      [RESPONSE_DATA_FIELD]: {
        group: groupName,
        username: username || "all",
        status: status || "all",
        sites: enrichedSites,
      },
    };

    res.json(response);
  } catch (error) {
    logger.error("Error in getSitesByGroup", error);
    res.status(500).json({ [ERROR_FIELD]: "Failed to fetch sites by group" });
  }
}

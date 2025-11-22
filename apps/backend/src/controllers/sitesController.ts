/**
 * Sites Controller
 *
 * Handles sites endpoints logic.
 */

import { Request, Response } from "express";
import type {
  GetUserSitesResponse,
  EnrichedSite,
  FilterRequest,
} from "@homevisit/common/src";
import { postgrestService } from "../services/postgrestService";
import { logger } from "../middleware/logger";
import {
  RESPONSE_SUCCESS_FIELD,
  RESPONSE_DATA_FIELD,
  ERROR_FIELD,
} from "../config/constants";
import { Site } from "@homevisit/common";
import { fetchOverlays } from "../services/overlayService";
import { mergeGeometriesToMultiPolygon } from "../utils/geometryMerger";
import {
  calcaulteIntersectionPrecent,
  createProjectLink,
  filterOverlaysByIntersection,
} from "../utils/siteEnricher";
import { cwd } from "process";

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

    const sites = (await postgrestService.getSites(
      groupName,
      username,
      status
    )) as any[];
    const group = await postgrestService.getGroupByName(groupName);
    const groudRefreshSeconds = group?.data_refreshments || 0;
    const wkt = mergeGeometriesToMultiPolygon(
      sites.map((site) => site.geometry)
    );
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - groudRefreshSeconds * 1000);
    const overlays = await fetchOverlays(wkt, startDate, endDate);
    const enrichedSites = await Promise.all(
      sites.map(async (site: any) => ({
        ...site,
        updatedStatus: await calcaulteIntersectionPrecent(site, overlays),
        siteLink: createProjectLink(site, overlays),
      }))
    );

    logger.info("Successfully fetched sites by group", {
      groupName,
      username,
      status,
      count: sites.length,
    });

    const response: any = enrichedSites;

    res.json(response);
  } catch (error) {
    logger.error("Error in getSitesByGroup", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({
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
    console.log(req.body);

    let status = req.body;
    console.log(req.body);
    if (!username || !siteName || !status) {
      res.status(400).json({
        [ERROR_FIELD]:
          "Missing required parameters: username, siteName, and status",
      });
      console.log("Missing required parameters:", {
        username,
        siteName,
        status,
      });
      return;
    }
    status = status.status;
    // Validate status is one of the allowed values
    const validStatuses = ["Seen", "Partial", "Not Seen"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        [ERROR_FIELD]: `Invalid status. Must be one of: ${validStatuses.join(
          ", "
        )}`,
      });
      console.log("Invalid status provided:", status);
      return;
    }

    logger.info("PUT /sites/:username/:siteName called", {
      username,
      siteName,
      status,
    });
    console.log("Updating site status with", { username, siteName, status });

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

/**
 * POST /sites - Fetch sites by group with advanced filtering
 * Query params:
 *   - group: string (required) - group name
 * Body:
 *   - username: string (optional) - username filter
 *   - seenStatuses: string[] (optional) - array of seen_status values to match
 *   - updatedStatuses: string[] (optional) - array of updatedStatus values to match
 */
export async function filterSites(req: Request, res: Response): Promise<void> {
  try {
    const groupName = req.query.group as string;

    if (!groupName) {
      res
        .status(400)
        .json({ [ERROR_FIELD]: "Missing required parameter: group" });
      return;
    }

    const filterRequest: FilterRequest = req.body;
    const { username, seenStatuses, updatedStatuses } = filterRequest;

    logger.info("POST /sites called with filters", {
      groupName,
      username,
      seenStatuses,
      updatedStatuses,
    });

    // Fetch raw sites from database (no filters yet)
    const sites = (await postgrestService.getSites(groupName)) as any[];
    const group = await postgrestService.getGroupByName(groupName);
    const groudRefreshSeconds = group?.data_refreshments || 0;
    const wkt = mergeGeometriesToMultiPolygon(
      sites.map((site) => site.geometry)
    );
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - groudRefreshSeconds * 1000);
    const overlays = await fetchOverlays(wkt, startDate, endDate);

    // Enrich all sites with updatedStatus
    const enrichedSites = await Promise.all(
      sites.map(async (site: any) => ({
        ...site,
        updatedStatus: await calcaulteIntersectionPrecent(site, overlays),
        siteLink: createProjectLink(site, overlays),
      }))
    );

    // Apply filters with AND logic
    let filteredSites = enrichedSites;

    // Filter by username if provided
    if (username) {
      filteredSites = filteredSites.filter(
        (site: any) => site.username === username
      );
    }

    // Filter by seen_status if provided
    console.log("Filtering by seenStatuses:", seenStatuses);

    if (seenStatuses && seenStatuses.length > 0) {
      filteredSites = filteredSites.filter((site: any) =>
        seenStatuses.includes(site.seen_status)
      );
    }

    // Filter by updatedStatus if provided
    if (updatedStatuses && updatedStatuses.length > 0) {
      filteredSites = filteredSites.filter((site: any) =>
        updatedStatuses.includes(site.updatedStatus)
      );
    }

    logger.info("Successfully filtered sites", {
      groupName,
      originalCount: enrichedSites.length,
      filteredCount: filteredSites.length,
    });

    const response: any = filteredSites;

    res.json(response);
  } catch (error) {
    logger.error("Error in filterSites", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({
      [ERROR_FIELD]: "Failed to filter sites",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

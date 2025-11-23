/**
 * Sites Controller
 *
 * Handles sites endpoints logic.
 */

import { Request, Response } from "express";
import type { FilterRequest } from "@homevisit/common/src";
import { postgrestService } from "../services/postgrestService";
import { logger } from "../middleware/logger";
import {
  sendError,
  sendValidationError,
  sendSuccess,
  sendNotFound,
} from "../utils/responseHelper";
import { fetchOverlays } from "../services/overlayService";
import { mergeGeometriesToMultiPolygon } from "../utils/geometryMerger";
import {
  calcaulteIntersectionPrecent,
  createProjectLink,
} from "../utils/siteEnricher";

/**
 * Helper to enrich sites with overlay data
 */
async function enrichSites(sites: any[], group: any) {
  if (sites.length === 0) return [];

  const wkt = mergeGeometriesToMultiPolygon(sites.map((s) => s.geometry));
  const endDate = new Date();
  const startDate = new Date(
    endDate.getTime() - (group?.data_refreshments || 0) * 1000
  );
  const overlays = await fetchOverlays(wkt, startDate, endDate);

  return Promise.all(
    sites.map(async (site) => ({
      ...site,
      updatedStatus: await calcaulteIntersectionPrecent(site, overlays),
      siteLink: createProjectLink(site, overlays),
    }))
  );
}

/**
 * GET /sites - Fetch sites by group
 */
export async function getSites(req: Request, res: Response): Promise<void> {
  try {
    const groupName = req.query.group as string;
    if (!groupName) {
      sendValidationError(res, "Missing required parameter: group");
      return;
    }

    const username = req.query.username as string | undefined;
    const status = req.query.status as string | undefined;

    const sites = (await postgrestService.getSites(
      groupName,
      username,
      status
    )) as any[];
    const group = await postgrestService.getGroupByName(groupName);
    const enrichedSites = await enrichSites(sites, group);

    logger.info("Sites fetched", { groupName, count: sites.length });
    sendSuccess(res, enrichedSites);
  } catch (error) {
    sendError(res, "Failed to fetch sites", 500, error);
  }
}

/**
 * POST /sites - Fetch sites with advanced filtering
 */
export async function filterSites(req: Request, res: Response): Promise<void> {
  try {
    const groupName = req.query.group as string;
    if (!groupName) {
      sendValidationError(res, "Missing required parameter: group");
      return;
    }

    const filterRequest: FilterRequest = req.body;
    logger.debug("Filter request received", {
      username: filterRequest.username,
      seenStatuses: filterRequest.seenStatuses,
      updatedStatuses: filterRequest.updatedStatuses,
      hasUsername: !!filterRequest.username,
      hasSeenStatuses: !!(
        filterRequest.seenStatuses && filterRequest.seenStatuses.length > 0
      ),
      hasUpdatedStatuses: !!(
        filterRequest.updatedStatuses &&
        filterRequest.updatedStatuses.length > 0
      ),
    });

    // Get sites with database-level filtering (only DB fields)
    const sites = (await postgrestService.getSitesWithFilters(groupName, {
      username: filterRequest.username,
      seenStatuses: filterRequest.seenStatuses,
    })) as any[];

    const group = await postgrestService.getGroupByName(groupName);
    const enrichedSites = await enrichSites(sites, group);

    // Filter by updatedStatus in RAM (runtime-calculated field)
    let filteredSites = enrichedSites;
    if (filterRequest.updatedStatuses?.length) {
      filteredSites = filteredSites.filter((site) =>
        filterRequest.updatedStatuses!.includes(site.updatedStatus)
      );
    }

    logger.info("Sites filtered", { groupName, count: filteredSites.length });
    sendSuccess(res, filteredSites);
  } catch (error) {
    sendError(res, "Failed to filter sites", 500, error);
  }
}

/**
 * PUT /sites/:username/:siteName - Update a site's seen_status
 */
export async function updateSiteStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { username, siteName } = req.params;
    const { status } = req.body;

    if (!username || !siteName || !status) {
      sendValidationError(
        res,
        "Missing required parameters: username, siteName, status"
      );
      return;
    }

    const validStatuses = ["Seen", "Partial", "Not Seen"];
    if (!validStatuses.includes(status)) {
      sendValidationError(
        res,
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
      return;
    }

    const updated = await postgrestService.updateSiteStatus(
      username,
      siteName,
      status
    );
    if (!updated) {
      sendNotFound(res, `Site for user ${username} with name ${siteName}`);
      return;
    }

    logger.info("Site status updated", { username, siteName, status });
    sendSuccess(res, { message: "Site status updated successfully" });
  } catch (error) {
    sendError(res, "Failed to update site status", 500, error);
  }
}

import { Request, Response } from "express";
import type { ISiteService } from "../services/site/interfaces/ISiteService.ts";
import type { IGroupService } from "../services/group/interfaces/IGroupService.ts";
import type { IEnrichmentService } from "../services/enrichment/interfaces/IEnrichmentService.ts";
import type { IFilterService } from "../services/filter/interfaces/IFilterService.ts";
import type { IEnrichmentCacheService } from "../services/enrichmentCache/interfaces/IEnrichmentCacheService.ts";
import type { ISiteHistoryService } from "../services/siteHistory/interfaces/ISiteHistoryService.ts";
import type { ICacheService } from "../services/cache/interfaces/ICacheService.ts";
import type {
  FilterRequest,
  Site,
  EnrichedSite,
  MergedHistoryResponse,
  SeenStatus,
} from "@homevisit/common";
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
    private filterService: IFilterService,
    private enrichmentCacheService: IEnrichmentCacheService,
    private coverUpdateCacheService: ICacheService<MergedHistoryResponse>,
    private siteHistoryService: ISiteHistoryService
  ) {}

  private mergeEnrichmentFromCache(
    sites: Site[],
    groupName: string
  ): EnrichedSite[] | null {
    const cachedData = this.enrichmentCacheService.get(groupName);
    if (!cachedData) {
      return null;
    }

    return sites.map((site) => {
      const enrichment = cachedData.siteEnrichments.get(site.site_name);
      return {
        ...site,
        updatedStatus: enrichment?.status ?? "No",
        siteLink: enrichment?.projectLink ?? "",
      };
    });
  }

  private async getEnrichedSites(
    sites: Site[],
    groupName: string
  ): Promise<EnrichedSite[]> {
    const fromCache = this.mergeEnrichmentFromCache(sites, groupName);
    if (fromCache) {
      logger.info("✅ Using cached enrichment data", { groupName });
      return fromCache;
    }

    logger.warn("⚠️ Cache miss - falling back to slow enrichment API", {
      groupName,
    });
    const group = await this.groupService.getByName(groupName);
    if (!group) {
      return this.mapSitesWithDefaultEnrichment(sites);
    }

    try {
      return await this.enrichmentService.enrichSites(sites, group);
    } catch (error) {
      // Fallback at controller level: enrichment failure returns default values
      logger.error("Enrichment API failed, using default values", error);
      return this.mapSitesWithDefaultEnrichment(sites);
    }
  }

  private mapSitesWithDefaultEnrichment(sites: Site[]): EnrichedSite[] {
    return sites.map((site) => ({
      ...site,
      updatedStatus: "No" as const,
      siteLink: "",
    }));
  }

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

      const enriched = await this.getEnrichedSites(sites, groupName);
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

      const enriched = await this.getEnrichedSites(sites, groupName);
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

      // Get site to find its group
      const site = await this.siteService.getSiteByName(siteName);
      if (!site) return sendNotFound(res, `Site ${siteName}`);

      // Get group to get group name for cache key
      const group = await this.groupService.getById(site.group_id);
      if (!group) {
        logger.warn("Group not found for site", {
          siteName,
          groupId: site.group_id,
        });
      }

      // Update status
      const updated = await this.siteService.updateStatus(siteName, status);
      if (!updated) return sendNotFound(res, `Site ${siteName}`);

      // Update today's history entry to keep it in sync
      if (group) {
        try {
          await this.siteHistoryService.upsertSiteHistory(
            site.site_id,
            status as SeenStatus,
            new Date() // Today's date
          );
          logger.info("Today's history updated for site status change", {
            siteName,
            status,
          });
        } catch (error) {
          logger.warn("Failed to update today's history when updating status", {
            siteName,
            error,
          });
          // Don't fail the request if history update fails
        }

        // Invalidate cover update cache (history cache) for this site
        const cacheKey = `${siteName}_${group.group_name}`;
        this.coverUpdateCacheService.delete(cacheKey);
        logger.info("Cache invalidated for site status update", {
          siteName,
          groupName: group.group_name,
          cacheKey,
        });
      }

      logger.info("Site status updated", { siteName, status });
      sendSuccess(res, { message: "Site status updated successfully" });
    } catch (error) {
      sendError(res, "Failed to update site status", 500, error);
    }
  }
}

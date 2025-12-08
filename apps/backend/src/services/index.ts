/**
 * Backend Services - All service exports
 *
 * Directory structure follows SOLID principles:
 * - Each service has its own directory
 * - Interfaces are co-located with implementations
 * - One type/class per file
 */

// PostgREST client
export type { IPostgRESTClient } from "./postgrest/interfaces/IPostgRESTClient.ts";
export { PostgRESTClient } from "./postgrest/postgrestClient.ts";

// Site service
export type { ISiteService } from "./site/interfaces/ISiteService.ts";
export { SiteService } from "./site/siteService.ts";

// Site history service
export type { ISiteHistoryService } from "./siteHistory/interfaces/ISiteHistoryService.ts";
export { SiteHistoryService } from "./siteHistory/siteHistoryService.ts";

// Cover update service
export type { ICoverUpdateService } from "./coverUpdate/interfaces/ICoverUpdateService.ts";
export { CoverUpdateService } from "./coverUpdate/coverUpdateService.ts";

// History merge service
export type { IHistoryMergeService } from "./historyMerge/interfaces/IHistoryMergeService.ts";
export { HistoryMergeService } from "./historyMerge/historyMergeService.ts";

// Group service
export type { IGroupService } from "./group/interfaces/IGroupService.ts";
export { GroupService } from "./group/groupService.ts";

// Enrichment service
export type { IEnrichmentService } from "./enrichment/interfaces/IEnrichmentService.ts";
export { EnrichmentService } from "./enrichment/enrichmentService.ts";

// Filter service
export type { IFilterService } from "./filter/interfaces/IFilterService.ts";
export { FilterService } from "./filter/filterService.ts";

// Overlay service
export type { IOverlayService } from "./overlay/interfaces/IOverlayService.ts";
export { OverlayService, fetchOverlays } from "./overlay/overlayService.ts";

// Geometry service
export type { IGeometryService } from "./geometry/interfaces/IGeometryService.ts";
export { GeometryService } from "./geometry/geometryService.ts";

// User service
export type { IUserService } from "./user/interfaces/IUserService.ts";
export { UserService } from "./user/userService.ts";

// Enrichment cache service
export type { IEnrichmentCacheService } from "./enrichmentCache/interfaces/IEnrichmentCacheService.ts";
export { EnrichmentCacheService } from "./enrichmentCache/enrichmentCacheService.ts";
export { EnrichmentCacheScheduler } from "./enrichmentCache/enrichmentCacheScheduler.ts";

// Generic cache service
export type { ICacheService } from "./cache/interfaces/ICacheService.ts";
export { GenericCacheService } from "./cache/GenericCacheService.ts";

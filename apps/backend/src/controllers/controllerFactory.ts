/**
 * Controller Factory - Creates controllers with proper dependency injection
 * Single Responsibility: Instantiate controllers with their dependencies
 */

import {
  PostgRESTClient,
  SiteService,
  GroupService,
  EnrichmentService,
  FilterService,
  SiteHistoryService,
  CoverUpdateService,
  HistoryMergeService,
  UserService,
  EnrichmentCacheService,
  EnrichmentCacheScheduler,
  GenericCacheService,
} from "../services/index.ts";
import type { MergedHistoryResponse } from "@homevisit/common";
import { SitesController } from "./sitesController.ts";
import { GroupController } from "./groupController.ts";
import { UserController } from "./userController.ts";
import { SiteHistoryController } from "./siteHistoryController.ts";
import { AuthController } from "./authController.ts";
import { CoverUpdateController } from "./coverUpdateController.ts";

// Create shared PostgREST client instance
const postgrestClient = new PostgRESTClient();

// Create service instances with dependencies
const siteService = new SiteService(postgrestClient);
const groupService = new GroupService(postgrestClient);
const userService = new UserService(postgrestClient);
const enrichmentService = new EnrichmentService();
const filterService = new FilterService();
const siteHistoryService = new SiteHistoryService(postgrestClient);
const coverUpdateService = new CoverUpdateService();
const historyMergeService = new HistoryMergeService();
const enrichmentCacheService = new EnrichmentCacheService();
const coverUpdateCacheService = new GenericCacheService<MergedHistoryResponse>(
  "coverUpdate"
);

// Create cache scheduler with dependencies
export const enrichmentCacheScheduler = new EnrichmentCacheScheduler(
  groupService,
  siteService,
  enrichmentService,
  enrichmentCacheService
);

// Export controller instances with injected dependencies
export const sitesController = new SitesController(
  siteService,
  groupService,
  enrichmentService,
  filterService,
  enrichmentCacheService
);
export const groupController = new GroupController(groupService);
export const userController = new UserController(userService);
export const siteHistoryController = new SiteHistoryController(
  siteHistoryService
);
export const authController = new AuthController(userService);
export const coverUpdateController = new CoverUpdateController(
  coverUpdateService,
  historyMergeService,
  siteHistoryService,
  groupService,
  siteService,
  coverUpdateCacheService
);

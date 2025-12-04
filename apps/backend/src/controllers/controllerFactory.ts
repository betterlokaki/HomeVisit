/**
 * Controller Factory - Creates controllers with proper dependency injection
 * Single Responsibility: Instantiate controllers with their dependencies
 */

import { PostgRESTClient } from "../services/postgrestClient.ts";
import { SiteHistoryService } from "../services/siteHistoryService.ts";
import { SitesController } from "./sitesController.ts";
import { GroupController } from "./groupController.ts";
import { UserController } from "./userController.ts";
import { SiteHistoryController } from "./siteHistoryController.ts";
import { AuthController } from "./authController.ts";
import { CoverUpdateController } from "./coverUpdateController.ts";

// Create shared PostgREST client instance
const postgrestClient = new PostgRESTClient();

// Create service instances with dependencies
const siteHistoryService = new SiteHistoryService(postgrestClient);

// Export controller instances with injected dependencies
export const sitesController = new SitesController(postgrestClient);
export const groupController = new GroupController(postgrestClient);
export const userController = new UserController(postgrestClient);
export const siteHistoryController = new SiteHistoryController(
  siteHistoryService
);
export const authController = new AuthController(postgrestClient);
export const coverUpdateController = new CoverUpdateController(postgrestClient);

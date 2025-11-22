/**
 * Sites routes
 */

import { Router } from "express";
import {
  getSites,
  updateSiteStatus,
  filterSites,
} from "../controllers/sitesController";

const router = Router();
/**
 * GET /sites
 * Get sites by group with optional filters
 * Query params:
 *   - group: string (required) - group name
 *   - username: string (optional) - filter by username
 *   - status: string (optional) - filter by status (Seen, Partial, Not Seen)
 */
router.get("/", getSites);

/**
 * POST /sites
 * Get sites by group with advanced filtering (AND logic)
 * Query params:
 *   - group: string (required) - group name
 * Body:
 *   - username: string (optional) - filter by username
 *   - seenStatuses: string[] (optional) - array of seen_status values to match
 *   - updatedStatuses: string[] (optional) - array of updatedStatus values to match
 */
router.post("/", filterSites);

/**
 * PUT /sites/:username/:siteName
 * Update a site's seen_status
 * Params:
 *   - username: string (required) - username
 *   - siteName: string (required) - site name
 * Body:
 *   - status: string (required) - new seen_status (Seen, Partial, Not Seen)
 */
router.put("/:username/:siteName", updateSiteStatus);

export default router;

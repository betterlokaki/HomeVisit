/**
 * Sites routes
 */

import { Router } from "express";
import { getSites, updateSiteStatus } from "../controllers/sitesController";

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

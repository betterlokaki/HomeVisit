/**
 * Sites routes
 */

import { Router } from "express";
import { getUserSites } from "../controllers/sitesController";

const router = Router();

/**
 * GET /sites/userSites
 * Get all sites for a user with enriched data (updatedStatus, siteLink)
 * Query params:
 *   - user_id: number (required)
 */
router.get("/userSites", getUserSites);

export default router;

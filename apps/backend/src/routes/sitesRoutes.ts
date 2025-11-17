/**
 * Sites routes
 */

import { Router } from "express";
import { getSitesByGroup } from "../controllers/sitesController";

const router = Router();
/**
 * GET /sites
 * Get sites by group with optional filters
 * Query params:
 *   - group: string (required) - group name
 *   - username: string (optional) - filter by username
 *   - status: string (optional) - filter by status (Seen, Partial, Not Seen)
 */
router.get("/", getSitesByGroup);

export default router;

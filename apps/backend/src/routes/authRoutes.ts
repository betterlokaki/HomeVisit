/**
 * Authentication routes
 */

import { Router } from "express";
import { loginUser } from "../controllers/authController";

const router = Router();

/**
 * POST /auth/login
 * Authenticate user and create user record
 * Body:
 *   - group_id: number (optional, defaults to 1)
 */
router.post("/login", loginUser);

export default router;

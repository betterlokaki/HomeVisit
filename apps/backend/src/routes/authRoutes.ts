/**
 * Authentication routes
 */

import { Router } from "express";
import { loginUser } from "../controllers/authController";

const router = Router();

/**
 * POST /auth/login
 * Authenticate user via username and get or create user ID
 * Body:
 *   - username: string (required)
 */
router.post("/login", loginUser);

export default router;

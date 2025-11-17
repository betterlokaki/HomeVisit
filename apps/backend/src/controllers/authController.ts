/**
 * Authentication Controller
 *
 * Handles authentication-related endpoints.
 */

import { Request, Response } from "express";
import { postgrestService } from "../services/postgrestService";
import { logger } from "../middleware/logger";
import { ERROR_FIELD } from "../config/constants";

/**
 * POST /auth/login - Authenticate user via username
 * Body:
 *   - username: string (required)
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string") {
      res
        .status(400)
        .json({ [ERROR_FIELD]: "Missing required field: username" });
      return;
    }

    logger.info("POST /auth/login called", { username });

    const userId = await postgrestService.getOrCreateUser(username);

    res.status(200).json({
      success: true,
      data: { user_id: userId },
    });
  } catch (error) {
    logger.error("Authentication failed", { error });
    res.status(500).json({
      [ERROR_FIELD]: "Authentication failed",
    });
  }
}

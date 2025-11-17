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
 * POST /auth/login - Authenticate user and get user_id
 * Body:
 *   - group_id: number (optional, defaults to 1)
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { group_id = 1 } = req.body;

    if (typeof group_id !== "number" || group_id <= 0) {
      res
        .status(400)
        .json({ [ERROR_FIELD]: "Invalid group_id: must be a positive number" });
      return;
    }

    logger.info("POST /auth/login called", { group_id });

    const userId = await postgrestService.getOrCreateUser(group_id);

    res.status(200).json({
      success: true,
      data: { user_id: userId, group_id },
    });
  } catch (error) {
    logger.error("Authentication failed", { error });
    res.status(500).json({
      [ERROR_FIELD]: "Authentication failed",
    });
  }
}

/**
 * Authentication Controller
 *
 * Handles authentication-related endpoints.
 */

import { Request, Response } from "express";
import { postgrestService } from "../services/postgrestService";
import { logger } from "../middleware/logger";
import {
  sendValidationError,
  sendSuccess,
  sendError,
} from "../utils/responseHelper";

/**
 * POST /auth/login - Authenticate user and get user_id
 * Body:
 *   - group_id: number (optional, defaults to 1)
 */
export async function loginUser(req: Request, res: Response): Promise<void> {
  try {
    const { group_id = 1 } = req.body;

    if (typeof group_id !== "number" || group_id <= 0) {
      sendValidationError(res, "Invalid group_id: must be a positive number");
      return;
    }

    const userId = await postgrestService.getOrCreateUser(group_id);

    logger.info("User logged in", { userId, groupId: group_id });
    sendSuccess(res, { user_id: userId, group_id });
  } catch (error) {
    sendError(res, "Authentication failed", 500, error);
  }
}

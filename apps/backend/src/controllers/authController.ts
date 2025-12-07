import { Request, Response } from "express";
import type { IUserService } from "../services/user/interfaces/IUserService.ts";
import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "../utils/responseHelper.ts";
import { logger } from "../middleware/logger.ts";

/**
 * Auth Controller - Single Responsibility: Authentication
 */
export class AuthController {
  constructor(private userService: IUserService) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { group_id = 1 } = req.body;

      if (!Number.isInteger(group_id) || group_id <= 0) {
        sendValidationError(res, "Invalid group_id");
        return;
      }

      const userId = await this.userService.getOrCreateUser(group_id);
      logger.info("User logged in", { userId, groupId: group_id });
      sendSuccess(res, { user_id: userId, group_id });
    } catch (error) {
      sendError(res, "Authentication failed", 500, error);
    }
  }
}

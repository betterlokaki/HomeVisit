import { Request, Response } from "express";
import { UserService } from "../services/userService.ts";
import type { IPostgRESTClient } from "../interfaces/IPostgRESTClient.ts";
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
  private userService: UserService;

  constructor(postgrest: IPostgRESTClient) {
    this.userService = new UserService(postgrest);
  }

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

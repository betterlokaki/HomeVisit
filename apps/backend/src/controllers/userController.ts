/**
 * User Controller - Single Responsibility: User operations within groups
 */

import { Request, Response } from "express";
import type { IPostgRESTClient } from "../interfaces/IPostgRESTClient.ts";
import { UserService } from "../services/userService.ts";
import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "../utils/responseHelper.ts";
import { logger } from "../middleware/logger.ts";

export class UserController {
  private userService: UserService;

  constructor(postgrest: IPostgRESTClient) {
    this.userService = new UserService(postgrest);
  }

  async getGroupUsers(req: Request, res: Response): Promise<void> {
    try {
      const groupName = req.query.group as string;
      if (!groupName) {
        sendValidationError(res, "Missing required parameter: group");
        return;
      }
      const users = await this.userService.getUsersByGroupName(groupName);
      logger.info("Group users fetched", { groupName, count: users.length });
      sendSuccess(res, { users });
    } catch (error) {
      sendError(res, "Failed to fetch group users", 500, error);
    }
  }
}

/**
 * Group Controller - Single Responsibility: Group operations
 */

import { Request, Response } from "express";
import type { IPostgRESTClient } from "../interfaces/IPostgRESTClient.ts";
import { GroupService } from "../services/groupService.ts";
import { sendSuccess, sendError } from "../utils/responseHelper.ts";
import { logger } from "../middleware/logger.ts";

export class GroupController {
  private groupService: GroupService;

  constructor(postgrest: IPostgRESTClient) {
    this.groupService = new GroupService(postgrest);
  }

  async getAllGroups(req: Request, res: Response): Promise<void> {
    try {
      const groups = await this.groupService.getAll();
      logger.info("All groups fetched", { count: groups.length });
      sendSuccess(res, { groups });
    } catch (error) {
      sendError(res, "Failed to fetch groups", 500, error);
    }
  }
}

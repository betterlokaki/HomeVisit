/**
 * Group Controller - Single Responsibility: Group operations
 */

import { Request, Response } from "express";
import type { IGroupService } from "../services/group/interfaces/IGroupService.ts";
import { sendSuccess, sendError } from "../utils/responseHelper.ts";
import { logger } from "../middleware/logger.ts";

export class GroupController {
  constructor(private groupService: IGroupService) {}

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

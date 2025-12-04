/**
 * Cover Update Routes - Routes for cover update history
 */

import { Router } from "express";
import { coverUpdateController } from "../controllers/controllerFactory.ts";

const router = Router();

/**
 * @openapi
 * /cover-update:
 *   post:
 *     summary: Get merged cover update and visit history for a site
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - siteId
 *               - groupId
 *             properties:
 *               siteId:
 *                 type: number
 *               groupId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Merged history data
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Site or group not found
 */
router.post("/", (req, res) =>
  coverUpdateController.getMergedHistory(req, res)
);

export default router;

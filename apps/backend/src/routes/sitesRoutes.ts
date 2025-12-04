import { Router } from "express";
import {
  sitesController,
  groupController,
  userController,
  siteHistoryController,
} from "../controllers/controllerFactory.ts";

const router = Router();

// Group routes
router.get("/groups", (req, res) => groupController.getAllGroups(req, res));

// Site routes
router.get("/", (req, res) => sitesController.getSites(req, res));
router.post("/", (req, res) => sitesController.filterSites(req, res));
router.put("/:siteName", (req, res) =>
  sitesController.updateSiteStatus(req, res)
);

// User routes
router.get("/group/users", (req, res) =>
  userController.getGroupUsers(req, res)
);

// Site history routes
router.get("/history", (req, res) =>
  siteHistoryController.getSiteHistory(req, res)
);
router.put("/history", (req, res) =>
  siteHistoryController.updateSiteHistory(req, res)
);

export default router;

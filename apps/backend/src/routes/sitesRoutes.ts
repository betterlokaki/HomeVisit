import { Router } from "express";
import { sitesController } from "../controllers/sitesController.js";

const router = Router();

router.get("/", (req, res) => sitesController.getSites(req, res));
router.post("/", (req, res) => sitesController.filterSites(req, res));
router.put("/:siteName", (req, res) =>
  sitesController.updateSiteStatus(req, res)
);

export default router;

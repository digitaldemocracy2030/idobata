import express from "express";
import {
  getSiteConfig,
  updateSiteConfig,
} from "../controllers/siteConfigController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSiteConfig);

router.put("/", protect, admin, updateSiteConfig);

export default router;

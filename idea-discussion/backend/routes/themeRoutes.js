import express from "express";
import {
  createTheme,
  deleteTheme,
  getAllThemes,
  getThemeById,
  getThemeDetail,
  updateTheme,
} from "../controllers/themeController.js";

const router = express.Router();

router.get("/", getAllThemes);

router.get("/:themeId", getThemeById);

router.get("/:themeId/detail", getThemeDetail);

router.post("/", createTheme);

router.put("/:themeId", updateTheme);

router.delete("/:themeId", deleteTheme);

export default router;

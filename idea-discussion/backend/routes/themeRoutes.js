import express from "express";
import {
  createTheme,
  deleteTheme,
  getAllThemes,
  getThemeById,
  updateTheme,
} from "../controllers/themeController.js";

const router = express.Router();

router.get("/", getAllThemes);

router.get("/:themeId", getThemeById);

router.post("/", createTheme);

router.put("/:themeId", updateTheme);

router.delete("/:themeId", deleteTheme);

export default router;

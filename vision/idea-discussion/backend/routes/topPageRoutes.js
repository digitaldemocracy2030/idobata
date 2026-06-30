import express from "express";
import { getTopPageData } from "../controllers/topPageController.js";

const router = express.Router();

router.get("/", getTopPageData);

export default router;

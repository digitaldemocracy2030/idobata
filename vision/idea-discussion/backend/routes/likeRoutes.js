import express from "express";
import { getLikeStatus, toggleLike } from "../controllers/likeController.js";

const router = express.Router();

router.get("/:targetType/:targetId", getLikeStatus);

router.post("/:targetType/:targetId", toggleLike);

export default router;

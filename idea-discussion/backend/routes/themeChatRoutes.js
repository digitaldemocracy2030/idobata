import express from "express";
import {
  getThreadExtractionsByTheme,
  getThreadMessagesByTheme,
  handleNewMessageByTheme,
  getThreadByUserAndTheme,
} from "../controllers/chatController.js";

const router = express.Router({ mergeParams: true });

router.post("/messages", handleNewMessageByTheme);

router.get("/threads/:threadId/extractions", getThreadExtractionsByTheme);

router.get("/threads/:threadId/messages", getThreadMessagesByTheme);

router.get("/thread", getThreadByUserAndTheme);

export default router;

import express from "express";
import {
  getThreadByUserAndQuestion,
  getThreadByUserAndTheme,
  getThreadExtractionsByTheme,
  getThreadMessagesByTheme,
  handleNewMessageByTheme,
} from "../controllers/chatController.js";

const router = express.Router({ mergeParams: true });

router.post("/messages", handleNewMessageByTheme);

router.get("/threads/:threadId/extractions", getThreadExtractionsByTheme);

router.get("/threads/:threadId/messages", getThreadMessagesByTheme);

// 既存のエンドポイント: theme IDとuser IDでスレッドを取得 (theme-level chats)
router.get("/thread", getThreadByUserAndTheme);

// 新しいエンドポイント: question IDとuser IDでスレッドを取得 (question-specific chats)
router.get("/thread-by-question", getThreadByUserAndQuestion);

export default router;

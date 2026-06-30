import express from "express";
import {
  PolicyChatService,
  PolicyChatServiceError,
} from "../services/policyChatService.js";
import { getToolDefinitions } from "../tools/index.js";
import {
  DatabaseError,
  ToolExecutionError,
  ValidationError,
} from "../types/errors.js";
import { ProcessChatMessageUsecase } from "../usecases/ProcessChatMessageUsecase.js";

const router = express.Router();

// POST /api/chat - Process a chat message
router.post("/", async (req, res) => {
  const policyChatService = new PolicyChatService();
  const usecase = new ProcessChatMessageUsecase(policyChatService);
  const result = await usecase.execute(req.body);

  if (result.isErr()) {
    const error = result.error;
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (
      error instanceof PolicyChatServiceError ||
      error instanceof ToolExecutionError
    ) {
      return res.status(500).json({ error: error.message });
    }
    if (error instanceof DatabaseError) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.status(500).json({ error: "Unknown error" });
  }

  return res.json(result.value);
});

// POST /api/chat/connect - Tools are executed in-process, so this always succeeds.
router.post("/connect", (req, res) => {
  return res.json({
    success: true,
    message: "Tools are available (executed in-process).",
  });
});

// GET /api/chat/status - Report available tools
router.get("/status", (req, res) => {
  return res.json({
    initialized: true,
    tools: getToolDefinitions(),
  });
});

export default router;

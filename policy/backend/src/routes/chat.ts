import express from "express";
import { McpClient } from "../mcp/client.js";
import {
  IdobataMcpService,
  IdobataMcpServiceError,
} from "../mcp/idobataMcpService.js";
import {
  DatabaseError,
  EnvironmentError,
  McpClientError,
  ValidationError,
} from "../types/errors.js";
import { ConnectMcpServerUsecase } from "../usecases/ConnectMcpServerUsecase.js";
import { ProcessChatMessageUsecase } from "../usecases/ProcessChatMessageUsecase.js";

const router = express.Router();
const mcpClientRef = { current: null as McpClient | null };

// POST /api/chat - Process a chat message
router.post("/", async (req, res) => {
  if (!mcpClientRef.current) {
    return res.status(500).json({ error: "MCP client is not initialized" });
  }

  const idobataMcpService = new IdobataMcpService(mcpClientRef.current);
  const usecase = new ProcessChatMessageUsecase(idobataMcpService);
  const result = await usecase.execute(req.body);

  if (result.isErr()) {
    const error = result.error;
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    if (
      error instanceof IdobataMcpServiceError ||
      error instanceof McpClientError
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

// POST /api/chat/connect - Connect to the MCP server
router.post("/connect", async (req, res) => {
  const usecase = new ConnectMcpServerUsecase(mcpClientRef);
  const result = await usecase.execute();

  if (result.isErr()) {
    const error = result.error;
    if (error instanceof EnvironmentError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof McpClientError) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "Unknown error" });
  }

  return res.json(result.value);
});

// GET /api/chat/status - Check MCP client status
router.get("/status", (req, res) => {
  return res.json({
    initialized: mcpClientRef.current !== null,
    tools: mcpClientRef.current ? mcpClientRef.current.tools : [],
  });
});

export default router;

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

// POST /api/chat/stream - Process a chat message with streaming
router.post("/stream", async (req, res) => {
  if (!mcpClientRef.current) {
    return res.status(500).json({ error: "MCP client is not initialized" });
  }

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  const idobataMcpService = new IdobataMcpService(mcpClientRef.current);
  const usecase = new ProcessChatMessageUsecase(idobataMcpService);

  let hasEnded = false;

  const cleanup = () => {
    if (!hasEnded) {
      hasEnded = true;
      res.end();
    }
  };

  req.on("close", cleanup);
  req.on("aborted", cleanup);

  try {
    const result = await usecase.executeStream(req.body, (chunk: string) => {
      if (!hasEnded) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    });

    if (result.isErr()) {
      const error = result.error;
      if (!hasEnded) {
        if (error instanceof ValidationError) {
          res.write(
            `data: ${JSON.stringify({ error: error.message, type: "validation" })}\n\n`
          );
        } else if (
          error instanceof IdobataMcpServiceError ||
          error instanceof McpClientError
        ) {
          res.write(
            `data: ${JSON.stringify({ error: error.message, type: "service" })}\n\n`
          );
        } else if (error instanceof DatabaseError) {
          res.write(
            `data: ${JSON.stringify({ error: "Internal server error", type: "database" })}\n\n`
          );
        } else {
          res.write(
            `data: ${JSON.stringify({ error: "Unknown error", type: "unknown" })}\n\n`
          );
        }
      }
    } else {
      if (!hasEnded) {
        res.write(`data: ${JSON.stringify({ complete: true })}\n\n`);
      }
    }
  } catch (error) {
    if (!hasEnded) {
      res.write(
        `data: ${JSON.stringify({ error: "Unexpected error occurred", type: "unexpected" })}\n\n`
      );
    }
  } finally {
    cleanup();
  }
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

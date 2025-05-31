import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Result, err, ok } from "neverthrow";
import { McpClientError } from "../types/errors.js";
import { logger } from "../utils/logger.js";

interface McpTool {
  name: string;
  description?: string;
  input_schema: Record<string, unknown>;
}

interface McpToolDefinition {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

// MCP Client class
export class McpClient {
  private mcp: Client;
  private transport: StdioClientTransport | null = null;
  private _tools: McpTool[] = [];
  private _initialized = false; // Track initialization status

  // Getter for tools
  get tools(): McpTool[] {
    return this._tools;
  }

  // Getter for initialization status
  get initialized(): boolean {
    return this._initialized;
  }

  constructor() {
    this.mcp = new Client({
      name: "idobata-policy-editor-client",
      version: "1.0.0",
    });
  }

  async connectToServer(serverScriptPath: string): Promise<Result<void, McpClientError>> {
    if (this._initialized) {
      logger.warn("MCP client is already initialized.");
      return ok(undefined);
    }

    const isJs = serverScriptPath.endsWith(".js");
    const isPy = serverScriptPath.endsWith(".py");

    if (!isJs && !isPy) {
      return err(new McpClientError("Server script must be a .js or .py file"));
    }

    const command = isPy
      ? process.platform === "win32"
        ? "python"
        : "python3"
      : process.execPath;

    const transportEnv: Record<string, string> = Object.entries(
      process.env
    ).reduce(
      (acc, [key, value]) => {
        if (typeof value === "string") {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, string>
    );

    const requiredEnvVars = [
      "GITHUB_APP_ID",
      "GITHUB_INSTALLATION_ID",
      "GITHUB_TARGET_OWNER",
      "GITHUB_TARGET_REPO",
    ];
    
    for (const key of requiredEnvVars) {
      const value = process.env[key];
      if (typeof value !== "string" || value.trim() === "") {
        return err(new McpClientError(
          `Missing or invalid required environment variable: ${key}`
        ));
      }
      transportEnv[key] = value;
    }

    try {
      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath],
        env: transportEnv,
      });

      await this.mcp.connect(this.transport);

      const toolsResult = await this.mcp.listTools();
      this._tools = toolsResult.tools.map((tool: unknown) => {
        const definedTool = tool as McpToolDefinition;
        return {
          name: definedTool.name,
          description: definedTool.description,
          input_schema: definedTool.inputSchema,
        };
      });

      this._initialized = true;

      logger.info(
        "Connected to MCP server with tools:",
        this.tools.map(({ name }) => name)
      );

      return ok(undefined);
    } catch (e) {
      logger.error("Failed to connect to MCP server:", e);
      this._initialized = false;
      this.transport = null;
      return err(new McpClientError(
        `Failed to connect to MCP server: ${e instanceof Error ? e.message : "Unknown error"}`
      ));
    }
  }

  listTools(): Result<McpTool[], McpClientError> {
    if (!this._initialized) {
      return err(new McpClientError("MCP client is not connected"));
    }
    return ok(this._tools);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<Result<unknown, McpClientError>> {
    if (!this._initialized || !this.mcp) {
      return err(new McpClientError("MCP client is not connected"));
    }

    try {
      const result = await this.mcp.callTool({
        name,
        arguments: args,
      });
      return ok(result);
    } catch (error) {
      return err(new McpClientError(
        `Failed to call tool ${name}: ${error instanceof Error ? error.message : "Unknown error"}`
      ));
    }
  }

  isConnected(): boolean {
    return this._initialized;
  }

  async cleanup(): Promise<Result<void, McpClientError>> {
    if (this.mcp && this._initialized) {
      try {
        await this.mcp.close();
        logger.info("MCP client connection closed.");
        return ok(undefined);
      } catch (error) {
        logger.error("Error closing MCP client connection:", error);
        return err(new McpClientError(
          `Failed to cleanup MCP client: ${error instanceof Error ? error.message : "Unknown error"}`
        ));
      } finally {
        this._initialized = false;
        this.transport = null;
        this._tools = [];
      }
    }
    return ok(undefined);
  }
}

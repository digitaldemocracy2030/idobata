import { Result, err, ok } from "neverthrow";
import { McpClient } from "../mcp/client.js";
import { EnvironmentError, McpClientError } from "../types/errors.js";
import { ConnectMcpServerResponse } from "../types/requests.js";
import { logger } from "../utils/logger.js";

export class ConnectMcpServerUsecase {
  constructor(private mcpClientRef: { current: McpClient | null }) {}

  async execute(): Promise<
    Result<ConnectMcpServerResponse, EnvironmentError | McpClientError>
  > {
    const serverPath = process.env.MCP_SERVER_PATH;
    if (!serverPath || typeof serverPath !== "string") {
      return err(
        new EnvironmentError(
          "MCP_SERVER_PATH environment variable is not configured correctly"
        )
      );
    }

    const cleanupResult = await this.cleanupExistingConnection();
    if (cleanupResult.isErr()) {
      return err(cleanupResult.error);
    }

    const connectResult = await this.establishConnection(serverPath);
    if (connectResult.isErr()) {
      return err(connectResult.error);
    }

    return ok({
      success: true,
      message: `Connected to MCP server at ${serverPath}`,
    });
  }

  private async cleanupExistingConnection(): Promise<
    Result<void, McpClientError>
  > {
    try {
      if (this.mcpClientRef.current) {
        await this.mcpClientRef.current.cleanup();
      }
      return ok(undefined);
    } catch (error) {
      return err(
        new McpClientError(
          `Failed to cleanup existing connection: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      );
    }
  }

  private async establishConnection(
    serverPath: string
  ): Promise<Result<void, McpClientError>> {
    try {
      this.mcpClientRef.current = new McpClient();
      await this.mcpClientRef.current.connectToServer(serverPath);
      logger.info(`MCP client connected to server at ${serverPath}`);
      return ok(undefined);
    } catch (error) {
      logger.error("Failed to initialize MCP client:", error);
      this.mcpClientRef.current = null;
      return err(
        new McpClientError(
          `Failed to connect to MCP server: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      );
    }
  }
}

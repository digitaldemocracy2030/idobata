import { Result, err, ok } from "neverthrow";
import { db } from "../db/index.js";
import { interactionLogs } from "../db/schema.js";
import {
  IdobataMcpService,
  IdobataMcpServiceError,
} from "../mcp/idobataMcpService.js";
import {
  DatabaseError,
  McpClientError,
  ValidationError,
} from "../types/errors.js";
import { ChatMessageRequest, ChatMessageResponse } from "../types/requests.js";
import { logger } from "../utils/logger.js";

export class ProcessChatMessageUsecase {
  constructor(private idobataMcpService: IdobataMcpService) {}

  async execute(
    request: ChatMessageRequest
  ): Promise<
    Result<
      ChatMessageResponse,
      ValidationError | IdobataMcpServiceError | McpClientError | DatabaseError
    >
  > {
    const validationResult = this.validateInput(request);
    if (validationResult.isErr()) {
      return err(validationResult.error);
    }

    const mcpResult = await this.processMcpQuery(request);
    if (mcpResult.isErr()) {
      return err(mcpResult.error);
    }

    const logResult = await this.logInteraction(request, mcpResult.value);
    if (logResult.isErr()) {
      logger.error("Failed to log interaction:", logResult.error);
    }

    return ok({ response: mcpResult.value });
  }

  private validateInput(
    request: ChatMessageRequest
  ): Result<ChatMessageRequest, ValidationError> {
    if (!request.message || typeof request.message !== "string") {
      return err(
        new ValidationError("Message is required and must be a string")
      );
    }

    if (request.branchId && typeof request.branchId !== "string") {
      return err(new ValidationError("branchId must be a string if provided"));
    }

    if (request.fileContent && typeof request.fileContent !== "string") {
      return err(
        new ValidationError("fileContent must be a string if provided")
      );
    }

    if (request.userName && typeof request.userName !== "string") {
      return err(new ValidationError("userName must be a string if provided"));
    }

    if (request.filePath && typeof request.filePath !== "string") {
      return err(new ValidationError("filePath must be a string if provided"));
    }

    if (request.searchAllFiles && typeof request.searchAllFiles !== "boolean") {
      return err(new ValidationError("searchAllFiles must be a boolean if provided"));
    }

    if (request.history && !Array.isArray(request.history)) {
      return err(new ValidationError("History must be an array of messages"));
    }

    return ok(request);
  }

  private async processMcpQuery(
    request: ChatMessageRequest
  ): Promise<Result<string, IdobataMcpServiceError | McpClientError>> {
    const result = await this.idobataMcpService.processQuery(
      request.message,
      request.history || [],
      request.branchId,
      request.fileContent,
      request.userName,
      request.filePath,
      request.searchAllFiles
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value);
  }

  private async logInteraction(
    request: ChatMessageRequest,
    response: string
  ): Promise<Result<void, DatabaseError>> {
    try {
      const sessionIdToLog = request.userName || "unknown_user";
      await db.insert(interactionLogs).values({
        sessionId: sessionIdToLog,
        userMessage: request.message,
        aiMessage:
          typeof response === "string" ? response : JSON.stringify(response),
      });
      logger.info(`Interaction logged for session: ${sessionIdToLog}`);
      return ok(undefined);
    } catch (error) {
      return err(
        new DatabaseError(
          `Failed to log interaction: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      );
    }
  }
}

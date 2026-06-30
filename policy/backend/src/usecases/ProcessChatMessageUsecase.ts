import { Result, err, ok } from "neverthrow";
import { db } from "../db/index.js";
import { interactionLogs } from "../db/schema.js";
import {
  PolicyChatService,
  PolicyChatServiceError,
} from "../services/policyChatService.js";
import {
  DatabaseError,
  ToolExecutionError,
  ValidationError,
} from "../types/errors.js";
import { ChatMessageRequest, ChatMessageResponse } from "../types/requests.js";
import { logger } from "../utils/logger.js";

export class ProcessChatMessageUsecase {
  constructor(private policyChatService: PolicyChatService) {}

  async execute(
    request: ChatMessageRequest
  ): Promise<
    Result<
      ChatMessageResponse,
      | ValidationError
      | PolicyChatServiceError
      | ToolExecutionError
      | DatabaseError
    >
  > {
    const validationResult = this.validateInput(request);
    if (validationResult.isErr()) {
      return err(validationResult.error);
    }

    const chatResult = await this.processChatQuery(request);
    if (chatResult.isErr()) {
      return err(chatResult.error);
    }

    const logResult = await this.logInteraction(request, chatResult.value);
    if (logResult.isErr()) {
      logger.error("Failed to log interaction:", logResult.error);
    }

    return ok({ response: chatResult.value });
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

    if (request.history && !Array.isArray(request.history)) {
      return err(new ValidationError("History must be an array of messages"));
    }

    return ok(request);
  }

  private async processChatQuery(
    request: ChatMessageRequest
  ): Promise<Result<string, PolicyChatServiceError | ToolExecutionError>> {
    const result = await this.policyChatService.processQuery(
      request.message,
      request.history || [],
      request.branchId,
      request.fileContent,
      request.userName,
      request.filePath
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

import { Result, err, ok } from "neverthrow";
import type {
  ChatConnectResponse,
  ChatMessageRequest,
  ChatMessageResponse,
  ChatStatusResponse,
} from "../types/api";
import type { HttpError } from "./errors";
import { createValidationError } from "./errors";
import { HttpClient } from "./httpClient";

export class ChatApiClient {
  private httpClient: HttpClient;

  constructor(baseUrl: string) {
    this.httpClient = new HttpClient(baseUrl);
  }

  async getStatus(): Promise<Result<ChatStatusResponse, HttpError>> {
    return this.httpClient.get<ChatStatusResponse>("/chat/status");
  }

  async connect(): Promise<Result<ChatConnectResponse, HttpError>> {
    return this.httpClient.post<ChatConnectResponse>("/chat/connect");
  }

  async sendMessage(
    request: ChatMessageRequest
  ): Promise<Result<ChatMessageResponse, HttpError>> {
    const validationResult = this.validateChatMessageRequest(request);
    if (validationResult.isErr()) {
      return err(validationResult.error);
    }

    return this.httpClient.post<ChatMessageResponse>("/chat", request);
  }

  private validateChatMessageRequest(
    request: ChatMessageRequest
  ): Result<void, HttpError> {
    if (!request.message || typeof request.message !== "string") {
      return err(
        createValidationError("Message is required and must be a string")
      );
    }

    if (request.message.trim() === "") {
      return err(createValidationError("Message cannot be empty"));
    }

    if (request.history && !Array.isArray(request.history)) {
      return err(createValidationError("History must be an array"));
    }

    if (request.branchId && typeof request.branchId !== "string") {
      return err(
        createValidationError("branchId must be a string if provided")
      );
    }

    if (request.fileContent && typeof request.fileContent !== "string") {
      return err(
        createValidationError("fileContent must be a string if provided")
      );
    }

    if (request.userName && typeof request.userName !== "string") {
      return err(
        createValidationError("userName must be a string if provided")
      );
    }

    if (request.filePath && typeof request.filePath !== "string") {
      return err(
        createValidationError("filePath must be a string if provided")
      );
    }

    return ok(undefined);
  }
}

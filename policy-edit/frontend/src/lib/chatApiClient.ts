import { Result, err, ok } from "neverthrow";
import type {
  ChatConnectResponse,
  ChatMessageRequest,
  ChatMessageResponse,
  ChatStatusResponse,
} from "../types/api";
import type { HttpError } from "./errors";
import {
  createNetworkError,
  createServerError,
  createUnknownError,
  createValidationError,
} from "./errors";
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

  async sendMessageStream(
    request: ChatMessageRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: HttpError) => void
  ): Promise<void> {
    const validationResult = this.validateChatMessageRequest(request);
    if (validationResult.isErr()) {
      onError(validationResult.error);
      return;
    }

    const url = `${this.httpClient.baseURL}/chat/stream`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: response.statusText }));
        onError(
          createServerError(
            errorData.error ||
              `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          )
        );
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError(
          createNetworkError(
            "Failed to get response reader",
            new Error("No reader available")
          )
        );
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data.trim()) {
                try {
                  const parsed = JSON.parse(data);

                  if (parsed.chunk) {
                    onChunk(parsed.chunk);
                  } else if (parsed.complete) {
                    onComplete();
                    return;
                  } else if (parsed.error) {
                    onError(
                      createServerError(parsed.error, 500, {
                        type: parsed.type,
                      })
                    );
                    return;
                  }
                } catch (parseError) {
                  console.warn("Failed to parse SSE data:", data);
                }
              }
            }
          }
        }

        onComplete();
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error) {
        onError(createNetworkError("Streaming request failed", error));
      } else {
        onError(createUnknownError("Unknown streaming error occurred", error));
      }
    }
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

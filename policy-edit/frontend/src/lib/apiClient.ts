import { Result, err, ok } from "neverthrow";
import type { OpenAIMessage } from "../types/chat";
import type { ChatError } from "../types/errors";
import { createValidationError } from "../types/errors";
import { httpClient } from "./httpClient";

interface ConnectionStatus {
  initialized: boolean;
}

interface ChatResponse {
  response: string;
}

export interface ChatPayload {
  message: string;
  history: OpenAIMessage[];
  branchId: string;
  fileContent: string | null;
  userName: string;
  filePath: string;
}

const validateChatPayload = (
  payload: ChatPayload
): Result<ChatPayload, ChatError> => {
  if (!payload.message.trim()) {
    return err(createValidationError("message", "メッセージが空です"));
  }

  if (!payload.userName.trim()) {
    return err(
      createValidationError("userName", "ユーザー名が設定されていません")
    );
  }

  if (!payload.filePath.trim()) {
    return err(
      createValidationError("filePath", "ファイルパスが設定されていません")
    );
  }

  return ok(payload);
};

export class ApiClient {
  async checkConnectionStatus(): Promise<Result<boolean, ChatError>> {
    const result = await httpClient.get<ConnectionStatus>("/chat/status");

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value.initialized);
  }

  async connectToServer(): Promise<Result<void, ChatError>> {
    const result = await httpClient.request("/chat/connect", {
      method: "POST",
    });

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(undefined);
  }

  async postChatMessage(
    payload: ChatPayload
  ): Promise<Result<string, ChatError>> {
    const validationResult = validateChatPayload(payload);
    if (validationResult.isErr()) {
      return err(validationResult.error);
    }

    const result = await httpClient.post<ChatResponse, ChatPayload>(
      "/chat",
      payload
    );

    if (result.isErr()) {
      return err(result.error);
    }

    return ok(result.value.response);
  }
}

export const apiClient = new ApiClient();

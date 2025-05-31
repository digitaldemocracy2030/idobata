import { Result } from "neverthrow";
import { type ChatPayload, apiClient } from "../lib/apiClient";
import type { ChatError } from "../types/errors";

export const sendChatMessage = async (
  payload: ChatPayload
): Promise<Result<string, ChatError>> => {
  return apiClient.postChatMessage(payload);
};

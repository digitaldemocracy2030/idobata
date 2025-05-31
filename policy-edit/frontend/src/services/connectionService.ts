import { Result } from "neverthrow";
import { apiClient } from "../lib/apiClient";
import type { ChatError } from "../types/errors";

export const checkConnectionStatus = async (): Promise<
  Result<boolean, ChatError>
> => {
  return apiClient.checkConnectionStatus();
};

export const connectToServer = async (): Promise<Result<void, ChatError>> => {
  return apiClient.connectToServer();
};

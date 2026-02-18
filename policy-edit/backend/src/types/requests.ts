import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface ChatMessageRequest {
  message: string;
  history?: ChatCompletionMessageParam[];
  branchId?: string;
  fileContent?: string;
  userName?: string;
  filePath?: string;
  searchAllFiles?: boolean;
}

export interface ChatMessageResponse {
  response: string;
}

export interface ConnectMcpServerResponse {
  success: boolean;
  message: string;
}

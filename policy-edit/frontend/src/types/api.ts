export interface OpenAIMessage {
  role: "user" | "assistant" | "system" | "function";
  content: string | null;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface ChatMessageRequest {
  message: string;
  history: OpenAIMessage[];
  branchId?: string | null;
  fileContent?: string | null;
  userName?: string | null;
  filePath?: string | null;
}

export interface ChatMessageResponse {
  response: string;
}

export interface ChatStatusResponse {
  initialized: boolean;
  tools: unknown[];
}

export interface ChatConnectResponse {
  success: boolean;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
}

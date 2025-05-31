export interface OpenAIMessage {
  role: "user" | "assistant" | "system" | "function";
  content: string | null;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

export interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export interface ChatThread {
  messages: ChatMessage[];
  branchId: string | null;
  nextMessageId: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export type { ChatError } from "./errors";

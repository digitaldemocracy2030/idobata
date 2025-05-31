import type { ChatMessage, OpenAIMessage } from "../types/chat";

export const getFormattedFileName = (path: string): string => {
  if (!path) return "";
  const fileName = path.split("/").pop() || "";
  return fileName.endsWith(".md") ? fileName.slice(0, -3) : fileName;
};

export const prepareChatHistory = (messages: ChatMessage[]): OpenAIMessage[] => {
  return messages.map(msg => ({
    role: msg.sender === "user" ? "user" : "assistant",
    content: msg.text,
  }));
};

export const generateBranchId = (): string => {
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `idobata-${randomPart}`;
};

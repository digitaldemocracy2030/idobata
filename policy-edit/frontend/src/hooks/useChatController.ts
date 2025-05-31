import { useCallback, useMemo, useState } from "react";
import useContentStore from "../store/contentStore";
import type { ChatMessage, ChatThread } from "../types/chat";
import { useChatMessages } from "./useChatMessages";
import { useServerConnection } from "./useServerConnection";
import { useUserManagement } from "./useUserManagement";

export interface UseChatControllerReturn {
  isChatEnabled: boolean;
  currentThread: ChatThread | null;
  messages: ChatMessage[];

  connection: {
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    connect: () => Promise<void>;
  };

  messageHandler: {
    isLoading: boolean;
    error: string | null;
  };

  userManager: {
    userName: string | null;
    promptForName: () => Promise<string>;
  };

  inputValue: string;
  setInputValue: (value: string) => void;
  handleSendMessage: () => Promise<void>;
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  addBotMessageToCurrentThread: (text: string) => void;
}

export function useChatController(): UseChatControllerReturn {
  const [inputValue, setInputValue] = useState("");

  const {
    currentPath,
    contentType,
    chatThreads,
    getOrCreateChatThread,
    addMessageToThread,
  } = useContentStore();

  const connection = useServerConnection();
  const messageHandler = useChatMessages();
  const userManager = useUserManagement();

  const isChatEnabled = useMemo(() => {
    return contentType === "file" && currentPath.endsWith(".md");
  }, [contentType, currentPath]);

  const currentThread = useMemo(() => {
    if (isChatEnabled) {
      return getOrCreateChatThread(currentPath);
    }
    return null;
  }, [isChatEnabled, currentPath, chatThreads, getOrCreateChatThread]);

  const messages = useMemo(() => {
    return currentThread?.messages ?? [];
  }, [currentThread]);

  const addBotMessageToCurrentThread = useCallback((text: string) => {
    if (isChatEnabled && currentPath) {
      addMessageToThread(currentPath, { text, sender: "bot" });
    } else {
      console.warn(
        "アクティブなMDファイルがないときにボットメッセージを追加しようとしました。"
      );
    }
  }, [isChatEnabled, currentPath, addMessageToThread]);

  const handleSendMessage = useCallback(async () => {
    if (
      inputValue.trim() === "" ||
      !isChatEnabled ||
      !currentPath ||
      !currentThread
    ) {
      return;
    }

    let userName = userManager.userName;
    if (!userName) {
      userName = await userManager.promptForName();
    }

    const userInput = inputValue;
    setInputValue("");

    try {
      await messageHandler.sendMessage(userInput, userName);
    } catch (err) {
      console.error("メッセージ送信エラー:", err);
    }
  }, [
    inputValue,
    isChatEnabled,
    currentPath,
    currentThread,
    userManager,
    messageHandler,
  ]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return {
    isChatEnabled,
    currentThread,
    messages,
    connection: {
      isConnected: connection.isConnected,
      isLoading: connection.isLoading,
      error: connection.error,
      connect: connection.connect,
    },
    messageHandler: {
      isLoading: messageHandler.isLoading,
      error: messageHandler.error,
    },
    userManager: {
      userName: userManager.userName,
      promptForName: userManager.promptForName,
    },
    inputValue,
    setInputValue,
    handleSendMessage,
    handleKeyDown,
    addBotMessageToCurrentThread,
  };
}

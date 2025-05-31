import { useCallback, useState } from "react";
import type { GitHubFile } from "../lib/github";
import { decodeBase64Content } from "../lib/github";
import useContentStore from "../store/contentStore";
import type { OpenAIMessage } from "../types/chat";
import { prepareChatHistory } from "../utils/chatUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface UseChatMessagesReturn {
  sendMessage: (message: string, userName: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useChatMessages(): UseChatMessagesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    currentPath,
    contentType,
    content,
    chatThreads,
    addMessageToThread,
    ensureBranchIdForThread,
    reloadCurrentContent,
  } = useContentStore();

  const sendMessage = useCallback(async (userInput: string, userName: string) => {
    if (!currentPath) {
      throw new Error("現在のパスが設定されていません");
    }

    const currentThread = chatThreads[currentPath];
    if (!currentThread) {
      throw new Error("チャットスレッドが見つかりません");
    }

    const currentBranchId = ensureBranchIdForThread(currentPath);

    addMessageToThread(currentPath, {
      text: userInput,
      sender: "user",
    });

    setIsLoading(true);
    setError(null);

    try {
      const historyForAPI: OpenAIMessage[] = prepareChatHistory(currentThread.messages);
      historyForAPI.push({ role: "user", content: userInput });

      let fileContent: string | null = null;
      if (contentType === "file" && content && "content" in content) {
        try {
          fileContent = decodeBase64Content((content as GitHubFile).content);
        } catch (e) {
          console.error("ファイルコンテンツのデコードに失敗しました:", e);
        }
      }

      const payload = {
        message: userInput,
        history: historyForAPI,
        branchId: currentBranchId,
        fileContent: fileContent,
        userName: userName,
        filePath: currentPath,
      };

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        addMessageToThread(currentPath, { text: data.response, sender: "bot" });
        console.log("ボットの応答を受信しました。コンテンツを再読み込みしています...");
        reloadCurrentContent();
      } else {
        const errorMsg = data.error || "応答の取得に失敗しました";
        setError(errorMsg);
        addMessageToThread(currentPath, {
          text: `エラー：${errorMsg}`,
          sender: "bot",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "不明なエラー";
      setError(errorMessage);
      addMessageToThread(currentPath, {
        text: `エラー：${errorMessage}`,
        sender: "bot",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPath,
    contentType,
    content,
    chatThreads,
    addMessageToThread,
    ensureBranchIdForThread,
    reloadCurrentContent,
  ]);

  return {
    sendMessage,
    isLoading,
    error,
  };
}

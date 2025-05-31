import { Result, err, ok } from "neverthrow";
import { useCallback, useState } from "react";
import type { GitHubFile } from "../lib/github";
import { decodeBase64Content } from "../lib/github";
import { sendChatMessage } from "../services/chatService";
import useContentStore from "../store/contentStore";
import type { ChatError } from "../types/chat";
import { createStateError } from "../types/errors";
import { prepareChatHistory } from "../utils/chatUtils";
import { formatErrorMessage } from "../utils/resultUtils";

export interface UseChatMessagesReturn {
  sendMessage: (
    message: string,
    userName: string
  ) => Promise<Result<void, ChatError>>;
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

  const sendMessage = useCallback(
    async (
      userInput: string,
      userName: string
    ): Promise<Result<void, ChatError>> => {
      if (!currentPath) {
        const error = createStateError("現在のパスが設定されていません");
        setError(formatErrorMessage(error));
        return err(error);
      }

      const currentThread = chatThreads[currentPath];
      if (!currentThread) {
        const error = createStateError("チャットスレッドが見つかりません");
        setError(formatErrorMessage(error));
        return err(error);
      }

      const currentBranchId = ensureBranchIdForThread(currentPath);

      addMessageToThread(currentPath, {
        text: userInput,
        sender: "user",
      });

      setIsLoading(true);
      setError(null);

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
        history: prepareChatHistory(currentThread.messages),
        branchId: currentBranchId,
        fileContent: fileContent,
        userName: userName,
        filePath: currentPath,
      };

      const result = await sendChatMessage(payload);

      if (result.isErr()) {
        const errorMsg = formatErrorMessage(result.error);
        setError(errorMsg);
        addMessageToThread(currentPath, {
          text: `エラー：${errorMsg}`,
          sender: "bot",
        });
        setIsLoading(false);
        return err(result.error);
      }

      addMessageToThread(currentPath, {
        text: result.value,
        sender: "bot",
      });

      console.log(
        "ボットの応答を受信しました。コンテンツを再読み込みしています..."
      );
      reloadCurrentContent();
      setIsLoading(false);

      return ok(undefined);
    },
    [
      currentPath,
      contentType,
      content,
      chatThreads,
      addMessageToThread,
      ensureBranchIdForThread,
      reloadCurrentContent,
    ]
  );

  return {
    sendMessage,
    isLoading,
    error,
  };
}

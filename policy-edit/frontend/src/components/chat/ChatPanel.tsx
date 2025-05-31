import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { chatApiClient } from "../../lib/api";
import type { GitHubFile } from "../../lib/github";
import { decodeBase64Content } from "../../lib/github";
import useContentStore from "../../store/contentStore";
import type { ChatMessageRequest, OpenAIMessage } from "../../types/api";
import MarkdownViewer from "../ui/MarkdownViewer";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const getFormattedFileName = (path: string): string => {
  if (!path) return "";
  const fileName = path.split("/").pop() || "";
  return fileName.endsWith(".md") ? fileName.slice(0, -3) : fileName;
};

const ChatPanel: React.FC = () => {
  // Local state for input, loading, connection, and general errors
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
  const [isConnected, setIsConnected] = useState(false); // MCP connection status
  const [error, setError] = useState<string | null>(null); // General error display
  const [userName, setUserName] = useState<string | null>(null); // State for user's name
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get state and actions from Zustand store
  const {
    currentPath,
    contentType, // Get the content type ('file' or 'dir')
    content, // Get the raw content object
    chatThreads,
    getOrCreateChatThread,
    addMessageToThread,
    ensureBranchIdForThread,
    reloadCurrentContent, // Import the reload action
  } = useContentStore();

  // Determine if a markdown file is currently active
  const isMdFileActive = useMemo(() => {
    return contentType === "file" && currentPath.endsWith(".md");
  }, [contentType, currentPath]);

  // Get the current chat thread and ensure branchId exists when an MD file is active
  const currentThread = useMemo(() => {
    if (isMdFileActive) {
      return getOrCreateChatThread(currentPath);
    }
    return null; // Return null if no MD file is active
  }, [isMdFileActive, currentPath, chatThreads, getOrCreateChatThread]); // chatThreads dependency is important

  const currentBranchId = useMemo(() => {
    if (isMdFileActive && currentPath) {
      // Ensure branchId exists and get it
      return ensureBranchIdForThread(currentPath);
    }
    return null;
  }, [isMdFileActive, currentPath, ensureBranchIdForThread, chatThreads]); // chatThreads dependency ensures re-run after branchId is set

  // Get messages for the current thread, or an empty array if none is active
  const messages = useMemo(() => {
    return currentThread?.messages ?? [];
  }, [currentThread]);

  // Check backend connection status on component mount
  // Check connection status and attempt auto-connect on mount
  useEffect(() => {
    const initializeConnection = async () => {
      setIsLoading(true);
      setError(null);

      const initiallyConnected = await checkConnectionStatus();

      if (initiallyConnected) {
        console.log("マウント時に既に接続されています。");
        setIsLoading(false);
        return;
      }

      console.log("Not connected, attempting auto-connection...");
      await connectToGithubContributionServer();
      const connectedAfterAttempt = await checkConnectionStatus();

      const currentStoreState = useContentStore.getState();
      const isActiveMd =
        currentStoreState.contentType === "file" &&
        currentStoreState.currentPath.endsWith(".md");
      const pathForMessage = currentStoreState.currentPath;

      if (!isActiveMd || !pathForMessage) {
        if (connectedAfterAttempt) {
          console.log("自動接続しましたが、メッセージを表示するアクティブなMDファイルがありません。");
        } else {
          console.warn("自動接続に失敗しましたが、メッセージを表示するアクティブなMDファイルがありません。");
        }
        setIsLoading(false);
        return;
      }

      if (connectedAfterAttempt) {
        addMessageToThread(pathForMessage, {
          text: "サーバーに自動接続しました。",
          sender: "bot",
        });
      } else {
        addMessageToThread(pathForMessage, {
          text: `エラー：サーバーへの自動接続に失敗しました。${error || "接続試行に失敗しました。"}`.trim(),
          sender: "bot",
        });
      }

      setIsLoading(false);
    };

    initializeConnection();
  }, []);

  // Get user name on mount
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []); // Run only once on mount

  const checkConnectionStatus = async (): Promise<boolean> => {
    const result = await chatApiClient.getStatus();

    if (result.isErr()) {
      console.error("接続ステータスの確認に失敗しました:", result.error);
      setIsConnected(false);
      return false;
    }

    const status = result.value.initialized;
    setIsConnected(status);
    return status;
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]); // Depends on the derived messages state

  const connectToGithubContributionServer = async () => {
    setIsLoading(true);
    setError(null);

    const result = await chatApiClient.connect();

    if (result.isErr()) {
      const errorMessage = result.error.message || "サーバーへの接続に失敗しました";
      setError(errorMessage);
      setIsConnected(false);
      setIsLoading(false);
      return;
    }

    setIsConnected(true);
    setIsLoading(false);
  };

  const addBotMessageToCurrentThread = (text: string) => {
    if (!isMdFileActive || !currentPath) {
      console.warn("アクティブなMDファイルがないときにボットメッセージを追加しようとしました。");
      return;
    }

    addMessageToThread(currentPath, { text, sender: "bot" });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Changed from HTMLInputElement
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || !isMdFileActive || !currentPath || !currentThread) {
      return;
    }

    if (!userName) {
      const name = prompt("お名前を入力してください（あなたの提案の記名に使用されます）：");
      const finalName = name || "匿名ユーザー";
      setUserName(finalName);
      localStorage.setItem("userName", finalName);

      if (!name) {
        console.warn("ユーザーが名前を提供しませんでした。");
      }
    }

    const userInput = inputValue;
    const userMessageContent = {
      text: userInput,
      sender: "user" as const,
    };

    addMessageToThread(currentPath, userMessageContent);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    const historyForAPI: OpenAIMessage[] = currentThread.messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));
    historyForAPI.push({ role: "user", content: userInput });

    let fileContent: string | null = null;
    if (contentType === "file" && content && "content" in content) {
      fileContent = decodeBase64Content((content as GitHubFile).content);
    }

    const request: ChatMessageRequest = {
      message: userInput,
      history: historyForAPI,
      branchId: currentBranchId,
      fileContent: fileContent,
      userName: userName,
      filePath: currentPath,
    };

    const result = await chatApiClient.sendMessage(request);

    if (result.isErr()) {
      const errorMessage = result.error.message || "応答の取得に失敗しました";
      setError(errorMessage);
      addMessageToThread(currentPath, {
        text: `エラー：${errorMessage}`,
        sender: "bot",
      });
      setIsLoading(false);
      return;
    }

    addMessageToThread(currentPath, {
      text: result.value.response,
      sender: "bot",
    });
    console.log("ボットの応答を受信しました。コンテンツを再読み込みしています...");
    reloadCurrentContent();
    setIsLoading(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Changed from HTMLInputElement
    // event.nativeEvent.isComposing check prevents sending on IME confirmation
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault(); // Prevent default Enter behavior (new line)
      handleSendMessage();
    }
    // Shift+Enter should still insert a newline, which is the default behavior for textarea, so no specific handling needed here.
  };

  return (
    <div className="flex flex-col h-full p-4 border-l border-gray-300 relative">
      {" "}
      {/* Added relative positioning */}
      {/* Display User Name and Branch ID at the top right - Removed for UI simplification */}
      {/* <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex items-center space-x-2">
        {userName && <span>👤 {userName}</span>}
        {isMdFileActive && currentBranchId && (
          <span>🌿 ブランチ：{currentBranchId}</span>
        )}
      </div> */}
      <div className="flex justify-between items-center mb-4 pt-2">
        {" "}
        {/* Added padding-top */}
        <h2 className="text-lg font-semibold flex-shrink-0">チャット</h2>
        {!isConnected && (
          <Button
            onClick={async () => {
              setIsLoading(true);
              setError(null);

              await connectToGithubContributionServer();
              const connected = await checkConnectionStatus();

              if (!isMdFileActive || !currentPath) {
                setIsLoading(false);
                return;
              }

              if (connected) {
                addBotMessageToCurrentThread("手動接続に成功しました。");
              } else {
                addBotMessageToCurrentThread(
                  `エラー：手動接続に失敗しました。${error || ""}`.trim()
                );
              }

              setIsLoading(false);
            }}
            disabled={isLoading}
            variant="default"
            size="sm"
            className="bg-accent hover:bg-accent-dark"
          >
            {isLoading ? "接続中..." : "サーバーに接続"}
          </Button>
        )}
        {isConnected && (
          <span className="text-sm text-accent-dark font-medium">
            ✓ 接続済み
          </span>
        )}
      </div>
      {/* Chat messages area */}
      <div
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto mb-4 pr-2 space-y-2"
      >
        {!isMdFileActive ? (
          <div className="text-gray-500 text-center py-4 h-full flex items-center justify-center">
            気になるファイルをクリックしてチャットを開始しましょう。
          </div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            {isConnected
              ? `表示中のドキュメント「${getFormattedFileName(currentPath)}」について質問や意見を入力してください。または「こんにちは」と挨拶してみましょう！`
              : "チャットを開始するにはサーバーに接続してください。"}
          </div>
        ) : (
          // Render messages from the current thread
          messages.map((message) => (
            <div
              key={`${currentPath}-${message.id}`} // Use path in key for potential stability if IDs reset
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-2 rounded-lg max-w-[80%] ${
                  // Removed whitespace-pre-wrap as MarkdownViewer handles formatting
                  message.sender === "user"
                    ? "bg-primary-500 text-white chat-bubble-user" // Added chat-bubble-user class
                    : "bg-secondary-200 text-secondary-800 chat-bubble-bot" // Added chat-bubble-bot class
                }`}
              >
                {/* Render message content using MarkdownViewer */}
                <MarkdownViewer content={message.text} />
              </div>
            </div>
          ))
        )}
        {/* Show loading indicator only when an MD file is active and loading */}
        {isMdFileActive && isLoading && (
          <div className="text-center py-2">
            <span className="inline-block animate-pulse">考え中...</span>
          </div>
        )}
      </div>
      {/* Input area - only enabled when an MD file is active */}
      <div
        className={`flex-shrink-0 flex ${!isMdFileActive ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Textarea
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isMdFileActive
              ? "メッセージを入力してください（Shift+Enterで改行）..."
              : "MDファイルを選択"
          }
          disabled={isLoading || !isConnected || !isMdFileActive}
          rows={3}
          className="resize-none rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 border-r-0"
        />
        <Button
          onClick={handleSendMessage}
          disabled={
            isLoading ||
            !isConnected ||
            !isMdFileActive ||
            inputValue.trim() === ""
          }
          variant="default"
          className="rounded-l-none bg-primary-500 hover:bg-primary-600 text-white h-auto border-l-0"
        >
          {isLoading ? "..." : "送信"}
        </Button>
      </div>
    </div>
  );
};

export default ChatPanel;

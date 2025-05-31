import type React from "react";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../types/chat";
import { getFormattedFileName } from "../../utils/chatUtils";
import MarkdownViewer from "../ui/MarkdownViewer";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isChatEnabled: boolean;
  isConnected: boolean;
  currentPath: string;
}

function MessageList({
  messages,
  isLoading,
  isChatEnabled,
  isConnected,
  currentPath,
}: MessageListProps): React.ReactElement {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={chatContainerRef}
      className="flex-grow overflow-y-auto mb-4 pr-2 space-y-2"
    >
      {!isChatEnabled ? (
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
        messages.map((message) => (
          <div
            key={`${currentPath}-${message.id}`}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-2 rounded-lg max-w-[80%] ${
                message.sender === "user"
                  ? "bg-primary-500 text-white chat-bubble-user"
                  : "bg-secondary-200 text-secondary-800 chat-bubble-bot"
              }`}
            >
              <MarkdownViewer content={message.text} />
            </div>
          </div>
        ))
      )}
      {isChatEnabled && isLoading && (
        <div className="text-center py-2">
          <span className="inline-block animate-pulse">考え中...</span>
        </div>
      )}
    </div>
  );
}

export default MessageList;

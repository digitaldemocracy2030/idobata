import { useEffect, useRef } from "react";
import { cn } from "../../../lib/utils";
import {
  Message,
  SystemMessage,
  SystemNotification,
  UserMessage,
} from "../../../types";
import { StreamingText } from "./StreamingText";

interface ExtendedChatHistoryProps {
  messages: Message[];
}

function ExtendedChatHistory({ messages }: ExtendedChatHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sortedMessages = [...messages].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
  );

  return (
    <div className="flex-grow px-3 py-2 overflow-y-auto space-y-2 custom-scrollbar">
      {sortedMessages.map((msg, index) => (
        <div
          key={`${msg.createdAt.toISOString()}-${index}`}
          className={cn("animate-fade-in mb-2", {
            "flex justify-end": msg instanceof UserMessage,
            "flex justify-start": msg instanceof SystemMessage,
            "flex justify-center": msg instanceof SystemNotification,
          })}
        >
          <div
            className={cn("flex flex-col max-w-[95%]", {
              "items-end": msg instanceof UserMessage,
              "items-start": msg instanceof SystemMessage,
              "items-center": msg instanceof SystemNotification,
            })}
          >
            <div
              className={cn("inline-block py-2 px-3 break-words", {
                "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tr-sm":
                  msg instanceof UserMessage,
                "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm":
                  msg instanceof SystemMessage,
                "bg-gray-100 border border-gray-200 text-gray-700 rounded-2xl":
                  msg instanceof SystemNotification,
              })}
            >
              <div className="text-sm whitespace-pre-wrap leading-tight">
                {msg.isStreaming ? (
                  <StreamingText content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
            {/* タイムスタンプは表示しない */}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default ExtendedChatHistory;

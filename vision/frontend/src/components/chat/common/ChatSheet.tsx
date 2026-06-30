import { Bot, Loader2 } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useDraggable } from "../../../hooks/useDraggable";
import { Button } from "../../ui/button";
import {
  ChatSheet as BaseChatSheet,
  ChatSheetContent,
} from "../../ui/chat/chat-sheet";
import { useChat } from "./ChatProvider";
import ExtendedChatHistory from "./ExtendedChatHistory";

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (message: string) => void;
  isDesktop?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
}

export const ChatSheet: React.FC<ChatSheetProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  isDesktop = false,
  disabled = false,
  disabledMessage = "このテーマではコメントが無効化されています",
}) => {
  const { messages, addMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { height } = useDraggable({
    minHeight: 400,
    maxHeight: window.innerHeight * 0.9,
    initialHeight: window.innerHeight * 0.75,
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isSending && isOpen && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [isSending, isOpen, disabled]);

  const handleSendMessage = () => {
    if (inputValue.trim() && !isSending) {
      setIsSending(true);

      const message = inputValue;
      setInputValue("");

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = "48px";
      }

      if (onSendMessage) {
        try {
          onSendMessage(message);
          setTimeout(() => {
            setIsSending(false);
          }, 1000);
        } catch (error) {
          console.error("Error sending message:", error);
          setIsSending(false);
        }
      } else {
        addMessage(message, "user");
        setTimeout(() => {
          setIsSending(false);
        }, 1000);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  };

  const handleKeyDown = (
    e: React.KeyboardEvent & {
      isComposing?: boolean;
      nativeEvent: { isComposing?: boolean };
    }
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !isSending &&
      !e.isComposing &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderDisabledState = () => (
    <div className="p-4 bg-gray-100 text-gray-500 text-center border-t">
      <p>{disabledMessage}</p>
    </div>
  );

  // For desktop view, we don't use the sheet component
  if (isDesktop) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-[#E1EAFB] to-[#E5F5F7]">
        {/* AI Chat Header - Fixed at top */}
        <div className="flex items-center gap-2 p-3 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800">
            AIチャット対話
          </h2>
        </div>

        {/* Chat Messages Area - Scrollable middle section */}
        <div className="flex-1 overflow-auto px-3 py-2 space-y-2">
          <ExtendedChatHistory messages={messages} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="flex-shrink-0 bg-gradient-to-br from-[#E1EAFB] to-[#E5F5F7] border-t border-gray-200">
          {disabled ? (
            renderDisabledState()
          ) : (
            <div className="px-4 pb-4 pt-2">
              <div className="bg-white rounded-2xl border border-gray-400 pb-3">
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="ここに入力"
                  className="w-full px-4 py-3 bg-white border-0 rounded-2xl focus:outline-none text-base resize-none min-h-12 max-h-32 text-gray-700 placeholder-gray-400"
                  disabled={isSending}
                  rows={1}
                  style={{ height: "48px", overflow: "hidden" }}
                  ref={inputRef}
                />
                <div className="flex justify-between items-end px-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-full px-3 py-1 text-xs h-7 font-medium"
                      onClick={() => onSendMessage?.("お題を変える")}
                    >
                      お題を変える
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-full px-3 py-1 text-xs h-7 font-medium"
                      onClick={() => onSendMessage?.("対話を終わる")}
                    >
                      対話を終わる
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-10 h-10 flex items-center justify-center text-xl font-bold shadow-sm flex-shrink-0"
                    disabled={!inputValue.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "↑"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile view uses the sheet component
  return (
    <BaseChatSheet open={isOpen} onOpenChange={onClose}>
      <ChatSheetContent
        className="p-0 h-auto rounded-t-xl overflow-hidden bg-gradient-to-br from-[#E1EAFB] to-[#E5F5F7] flex flex-col"
        style={{ height: `${height}px` }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          if (!disabled) inputRef.current?.focus();
        }}
      >
        {/* AI Chat Header - Fixed at top */}
        <div className="flex items-center gap-2 p-3 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800">
            AIチャット対話
          </h2>
        </div>

        {/* Chat Messages Area - Scrollable middle section */}
        <div className="flex-1 overflow-auto px-3 py-2 space-y-2">
          <ExtendedChatHistory messages={messages} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="flex-shrink-0 bg-gradient-to-br from-[#E1EAFB] to-[#E5F5F7] border-t border-gray-200">
          {disabled ? (
            renderDisabledState()
          ) : (
            <div className="px-4 pb-4 pt-2">
              <div className="bg-white rounded-2xl border border-gray-400 pb-3">
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="ここに入力"
                  className="w-full px-4 py-3 bg-white border-0 rounded-2xl focus:outline-none text-base resize-none min-h-12 max-h-32 text-gray-700 placeholder-gray-400"
                  disabled={isSending}
                  rows={1}
                  style={{ height: "48px", overflow: "hidden" }}
                  ref={inputRef}
                />
                <div className="flex justify-between items-end px-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-full px-3 py-1 text-xs h-7 font-medium"
                      onClick={() => onSendMessage?.("お題を変える")}
                    >
                      お題を変える
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-full px-3 py-1 text-xs h-7 font-medium"
                      onClick={() => onSendMessage?.("対話を終わる")}
                    >
                      対話を終わる
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-10 h-10 flex items-center justify-center text-xl font-bold shadow-sm flex-shrink-0"
                    disabled={!inputValue.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "↑"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ChatSheetContent>
    </BaseChatSheet>
  );
};

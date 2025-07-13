import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { type MessageType } from "../../../types";
import { type PageContext } from "../../../utils/chatMessages";
import { FloatingChatButton } from "../mobile/FloatingChatButton";
import { ChatProvider, useChat } from "./ChatProvider";
import { ChatSheet } from "./ChatSheet";

interface FloatingChatProps {
  onSendMessage?: (message: string) => void;
  onClose?: () => void;
  onOpen?: () => void;
  disabled?: boolean;
  disabledMessage?: string;
  pageContext?: PageContext;
}

export interface FloatingChatRef {
  addMessage: (content: string, type: MessageType) => void;
  startStreamingMessage: (content: string, type: MessageType) => string;
  updateStreamingMessage: (id: string, content: string) => void;
  endStreamingMessage: (id: string) => void;
  clearMessages: () => void;
}

const FloatingChatInner = forwardRef<FloatingChatRef, FloatingChatProps>(
  (
    {
      onSendMessage,
      onClose,
      onOpen,
      disabled = false,
      disabledMessage = "このテーマではコメントが無効化されています",
      pageContext,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 1280px)");

    const {
      addMessage,
      startStreamingMessage,
      updateStreamingMessage,
      endStreamingMessage,
      clearMessages,
    } = useChat();

    // On desktop, chat is always open
    useEffect(() => {
      if (isDesktop && !isOpen) {
        setIsOpen(true);
        onOpen?.();
      }
    }, [isDesktop, isOpen, onOpen]);

    const handleOpen = () => {
      setIsOpen(true);
      setHasUnread(false);
      onOpen?.();
    };

    const handleClose = () => {
      // Only allow closing on mobile
      if (!isDesktop) {
        setIsOpen(false);
        onClose?.();
      }
    };

    const handleSendMessage = (message: string) => {
      onSendMessage?.(message);
    };

    useImperativeHandle(ref, () => ({
      addMessage: (content: string, type: MessageType) => {
        addMessage(content, type);
        if (!isOpen) setHasUnread(true);
      },
      startStreamingMessage: (content: string, type: MessageType) => {
        const id = startStreamingMessage(content, type);
        if (!isOpen) setHasUnread(true);
        return id;
      },
      updateStreamingMessage,
      endStreamingMessage,
      clearMessages,
    }));

    return (
      <>
        {/* On mobile: Show floating button when chat is closed */}
        {!isDesktop && !isOpen && (
          <FloatingChatButton
            onClick={handleOpen}
            hasUnread={hasUnread}
            disabled={disabled}
          />
        )}

        {/* Chat view - desktop: fixed sidebar, mobile: bottom sheet */}
        <div
          className={`
            ${
              isDesktop
                ? "fixed top-16 right-0 bottom-12 w-[40%] border-l border-b border-neutral-200 bg-white z-10 overflow-hidden"
                : ""
            }
          `}
        >
          {(isDesktop || isOpen) && (
            <ChatSheet
              isOpen={isOpen}
              onClose={handleClose}
              onSendMessage={handleSendMessage}
              isDesktop={isDesktop}
              disabled={disabled}
              disabledMessage={disabledMessage}
              pageContext={pageContext}
            />
          )}
        </div>
      </>
    );
  }
);

export const FloatingChat = forwardRef<FloatingChatRef, FloatingChatProps>(
  (props, ref) => {
    return (
      <ChatProvider>
        <FloatingChatInner {...props} ref={ref} />
      </ChatProvider>
    );
  }
);

FloatingChat.displayName = "FloatingChat";

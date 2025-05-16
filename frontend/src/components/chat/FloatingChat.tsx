import { forwardRef } from "react";
import { type MessageType } from "../../types";
import { ChatBase, type ChatBaseRef } from "./ChatBase";

interface FloatingChatProps {
  onSendMessage?: (message: string) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

export interface FloatingChatRef {
  addMessage: (content: string, type: MessageType) => void;
  startStreamingMessage: (content: string, type: MessageType) => string;
  updateStreamingMessage: (id: string, content: string) => void;
  endStreamingMessage: (id: string) => void;
  clearMessages: () => void;
}

/**
 * @deprecated Use ChatBase instead
 */
export const FloatingChat = forwardRef<FloatingChatRef, FloatingChatProps>(
  (props, ref) => {
    // This component now just wraps ChatBase for backward compatibility
    return <ChatBase {...props} ref={ref as React.RefObject<ChatBaseRef>} />;
  }
);

FloatingChat.displayName = "FloatingChat";

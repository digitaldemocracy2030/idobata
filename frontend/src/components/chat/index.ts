// Re-export components from their new locations
export { FloatingChat, type FloatingChatRef } from "./common/FloatingChat";
export { ChatProvider, useChat } from "./common/ChatProvider";
export { ChatSheet } from "./common/ChatSheet";
export { StreamingText } from "./common/StreamingText";
export { ChatHeader as DesktopChatHeader } from "./desktop/ChatHeader";
export { ChatHeader as MobileChatHeader } from "./mobile/ChatHeader";
export { FloatingChatButton } from "./mobile/FloatingChatButton";

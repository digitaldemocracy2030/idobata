import type React from "react";
import { useChatController } from "../../hooks/useChatController";
import ChatUI from "./ChatUI";

function ChatPanel(): React.ReactElement {
  const controller = useChatController();

  return <ChatUI controller={controller} />;
}

export default ChatPanel;

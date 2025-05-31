import type React from "react";
import useContentStore from "../../store/contentStore";
import type { UseChatControllerReturn } from "../../hooks/useChatController";
import ChatInput from "./ChatInput";
import ConnectionStatus from "./ConnectionStatus";
import MessageList from "./MessageList";

interface ChatUIProps {
  controller: UseChatControllerReturn;
}

function ChatUI({ controller }: ChatUIProps): React.ReactElement {
  const { currentPath } = useContentStore();

  const handleConnect = async () => {
    try {
      await controller.connection.connect();
      if (controller.isChatEnabled && currentPath) {
        if (controller.connection.isConnected) {
          controller.addBotMessageToCurrentThread("手動接続に成功しました。");
        } else {
          controller.addBotMessageToCurrentThread(
            `エラー：手動接続に失敗しました。${controller.connection.error || ""}`.trim()
          );
        }
      }
    } catch (err) {
      console.error("手動接続エラー:", err);
      const errorMessage = err instanceof Error ? err.message : "不明なエラー";
      if (controller.isChatEnabled && currentPath) {
        controller.addBotMessageToCurrentThread(
          `エラー：手動接続に失敗しました。${errorMessage}`
        );
      }
    }
  };

  const inputPlaceholder = controller.isChatEnabled
    ? "メッセージを入力してください（Shift+Enterで改行）..."
    : "MDファイルを選択";

  const isInputDisabled =
    controller.messageHandler.isLoading ||
    !controller.connection.isConnected ||
    !controller.isChatEnabled;

  return (
    <div className="flex flex-col h-full p-4 border-l border-gray-300 relative">
      <div className="flex justify-between items-center mb-4 pt-2">
        <h2 className="text-lg font-semibold flex-shrink-0">チャット</h2>
        <ConnectionStatus
          isConnected={controller.connection.isConnected}
          isLoading={controller.connection.isLoading}
          onConnect={handleConnect}
        />
      </div>

      <MessageList
        messages={controller.messages}
        isLoading={controller.messageHandler.isLoading}
        isChatEnabled={controller.isChatEnabled}
        isConnected={controller.connection.isConnected}
        currentPath={currentPath}
      />

      <ChatInput
        value={controller.inputValue}
        onChange={controller.setInputValue}
        onSend={controller.handleSendMessage}
        onKeyDown={controller.handleKeyDown}
        disabled={isInputDisabled}
        placeholder={inputPlaceholder}
        isLoading={controller.messageHandler.isLoading}
      />
    </div>
  );
}

export default ChatUI;

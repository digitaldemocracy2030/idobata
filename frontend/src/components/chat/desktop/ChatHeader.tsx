import type React from "react";
import { Button } from "../../ui/button";

interface ChatHeaderProps {
  onSendMessage?: (message: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onSendMessage }) => {
  const handleChangeTopicClick = () => {
    if (onSendMessage) {
      onSendMessage("このテーマに関して別の話題を話しましょう");
    }
  };

  const handleEndConversationClick = () => {
    if (onSendMessage) {
      onSendMessage("会話を終了");
    }
  };

  return (
    <div className="border-b flex items-center justify-between p-3">
      <h3 className="font-medium">チャット</h3>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleChangeTopicClick}
          className="text-sm bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200"
        >
          話題を変える
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEndConversationClick}
          className="text-sm bg-red-100 text-red-800 border border-red-300 hover:bg-red-200"
        >
          会話を終了
        </Button>
      </div>
    </div>
  );
};

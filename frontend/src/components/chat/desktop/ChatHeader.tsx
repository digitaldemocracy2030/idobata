import type React from "react";
import {
  type PageContext,
  generateChangeTopicMessage,
} from "../../../utils/chatMessages";
import { Button } from "../../ui/button";

interface ChatHeaderProps {
  onSendMessage?: (message: string) => void;
  pageContext?: PageContext;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onSendMessage,
  pageContext,
}) => {
  const handleChangeTopicClick = () => {
    if (onSendMessage) {
      onSendMessage(generateChangeTopicMessage(pageContext));
    }
  };

  return (
    <div className="border-b flex items-center justify-between p-3">
      <h3 className="font-medium">チャット</h3>
      <Button
        variant="outline"
        size="sm"
        onClick={handleChangeTopicClick}
        className="text-sm bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200"
      >
        話題を変える
      </Button>
    </div>
  );
};

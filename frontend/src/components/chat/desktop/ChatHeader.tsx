import type React from "react";
import { Button } from "../../ui/button";

interface ChatHeaderProps {
  onSendMessage?: (message: string) => void;
  onRestart?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onRestart,
}) => {
  const handleRestartClick = () => {
    if (onRestart) {
      onRestart();
    }
  };

  return (
    <div className="border-b flex items-center justify-between p-3">
      <h3 className="font-medium">チャット</h3>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRestartClick}
        className="text-sm bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200"
      >
        再スタート
      </Button>
    </div>
  );
};

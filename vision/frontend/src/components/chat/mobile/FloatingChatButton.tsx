import { Bot } from "lucide-react";
import type React from "react";
import { Button } from "../../ui/button";

interface FloatingChatButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
  disabled?: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onClick,
  hasUnread = false,
  disabled = false,
}) => {
  if (disabled) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-accentGradient rounded-full shadow-lg p-1 opacity-50">
          <div className="flex flex-grow items-center bg-white rounded-full justify-center">
            <div className="text-gray-500 text-center py-4">
              コメントが無効化されています
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-400"
      style={{ height: "80px", padding: "12px 20px" }}
    >
      <Button
        onClick={onClick}
        className="w-full text-white rounded-lg text-base font-semibold shadow-lg flex items-center justify-center gap-2"
        style={{
          height: "56px",
          padding: "0 24px",
          backgroundColor: "#2D80FF",
        }}
      >
        <Bot className="h-7 w-7" />
        AIと対話を開始する
        {hasUnread && (
          <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500" />
        )}
      </Button>
    </div>
  );
};

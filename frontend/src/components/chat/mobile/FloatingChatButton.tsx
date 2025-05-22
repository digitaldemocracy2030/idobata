import { Send } from "lucide-react";
import type React from "react";
import { cn } from "../../../lib/utils";
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
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div
        className={cn(
          "bg-accentGradient rounded-full shadow-lg p-1",
          hasUnread && "animate-pulse",
          disabled && "opacity-50"
        )}
      >
        <div className="flex flex-grow items-center bg-white rounded-full ">
          <input
            type="text"
            placeholder={
              disabled
                ? "このテーマではコメントが無効化されています"
                : "気になること・思ったことを伝える"
            }
            className="placeholder-gradient flex-grow px-5 py-4 bg-transparent border-none focus:outline-none text-base"
            readOnly
            onClick={disabled ? undefined : onClick}
          />
          <Button
            onClick={disabled ? undefined : onClick}
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 mr-2 flex items-center justify-center"
            disabled={disabled}
          >
            <Send className="h-5 w-5" />
            {hasUnread && (
              <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

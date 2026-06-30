import { MessageCircle } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface FloatingChatButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onClick,
  isVisible,
}) => {
  return (
    <Button
      onClick={onClick}
      variant="default"
      size="lg"
      className={`fixed bottom-4 right-4 bg-primary-500 text-white rounded-full px-4 py-3 shadow-lg hover:bg-primary-600 transition-all duration-300 z-50 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-label="チャットを開く"
    >
      <MessageCircle className="text-xl" />
      <span className="text-sm font-medium">質問してみよう</span>
    </Button>
  );
};

export default FloatingChatButton;

import { MessageCircle } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

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
      className={`fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-all duration-300 z-50 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-label="チャットを開く"
    >
      <MessageCircle className="text-xl" />
    </Button>
  );
};

export default FloatingChatButton;

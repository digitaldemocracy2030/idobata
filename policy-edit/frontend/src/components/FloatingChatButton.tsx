import React from "react";
import { FaComments } from "react-icons/fa";

interface FloatingChatButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onClick,
  isVisible,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 z-50 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-label="チャットを開く"
    >
      <FaComments className="text-xl" />
    </button>
  );
};

export default FloatingChatButton;

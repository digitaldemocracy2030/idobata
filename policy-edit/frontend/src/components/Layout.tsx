import type React from "react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import ChatPanel from "./ChatPanel";
import FloatingChatButton from "./FloatingChatButton";

const Layout: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };

    checkIfMobile();

    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsChatVisible(true);
    } else {
      setIsChatVisible(false); // Hide chat by default on mobile
    }
  }, [isMobile]);

  const toggleChat = () => {
    setIsChatVisible((prev) => !prev);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Content Area - Full height on mobile when chat is hidden, Right side on desktop */}
      <div
        className={`${isMobile && isChatVisible ? "h-1/2" : "h-full"} md:h-screen md:w-2/3 overflow-y-auto p-4 order-1 md:order-2`}
      >
        <Outlet /> {/* Nested routes will render here */}
      </div>

      {/* Chat Panel - Bottom half on mobile when visible, Left side on desktop */}
      <div
        className={`${
          isMobile
            ? isChatVisible
              ? "h-1/2 translate-y-0 opacity-100 pointer-events-auto"
              : "h-1/2 translate-y-full opacity-0 pointer-events-none"
            : "h-screen md:w-1/3"
        } md:translate-y-0 md:opacity-100 md:pointer-events-auto border-t md:border-t-0 md:border-r border-gray-300 overflow-y-auto fixed bottom-0 left-0 right-0 md:static md:order-1 transition-all duration-300 ease-in-out z-40 bg-white relative`}
      >
        {/* Close button - Only visible on mobile when chat is visible */}
        {isMobile && isChatVisible && (
          <button
            type="button"
            onClick={toggleChat}
            className="absolute top-2 right-2 bg-gray-200 text-gray-600 rounded-full p-1 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 z-50"
            aria-label="チャットを閉じる"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              role="img"
              aria-labelledby="closeButtonTitle"
            >
              <title id="closeButtonTitle">閉じる</title>
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        <ChatPanel />
      </div>

      {/* Floating Chat Button - Only visible on mobile */}
      <FloatingChatButton
        onClick={toggleChat}
        isVisible={isMobile && !isChatVisible}
      />
    </div>
  );
};

export default Layout;

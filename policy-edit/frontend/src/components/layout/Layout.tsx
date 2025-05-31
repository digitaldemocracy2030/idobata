import { X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import ChatPanel from "../chat/ChatPanel";
import FloatingChatButton from "../chat/FloatingChatButton";
import { Button } from "../ui/button";
import Header from "./Header";
import MenuPanel from "./menu/MenuPanel";

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
    <div className="flex flex-col h-screen">
      {/* Header - 全画面幅で最上部に配置 */}
      <Header />

      {/* Main Content Area - ヘッダー下に配置 */}
      <div className="flex flex-1 min-h-0">
        {/* PC版メニューパネル - 左側に常時表示 */}
        {!isMobile && (
          <MenuPanel isOpen={true} isMobile={false}>
            <div className="text-gray-500 text-sm">
              メニューコンテンツは後から追加されます
            </div>
          </MenuPanel>
        )}

        {/* Content and Chat Area */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 min-w-0">
          {/* Content Area - 右側 */}
          <div
            className={`${isMobile && isChatVisible ? "h-1/2" : "flex-1"} ${!isMobile ? "flex-[2]" : ""} overflow-y-auto p-4 order-1 md:order-2 min-h-0 min-w-0`}
          >
            <Outlet /> {/* Nested routes will render here */}
          </div>

          {/* Chat Panel - 左側 */}
          <div
            className={`${
              isMobile
                ? isChatVisible
                  ? "h-1/2 translate-y-0 opacity-100 pointer-events-auto"
                  : "h-1/2 translate-y-full opacity-0 pointer-events-none"
                : "flex-[1]"
            } md:translate-y-0 md:opacity-100 md:pointer-events-auto border-t md:border-t-0 md:border-r border-gray-300 overflow-y-auto fixed bottom-0 left-0 right-0 md:static md:order-1 transition-all duration-300 ease-in-out z-40 bg-white min-h-0 min-w-0`}
          >
            {/* Close button - モバイルでチャットが表示されている時のみ表示 */}
            {isMobile && isChatVisible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="absolute top-2 right-2 bg-gray-200 text-gray-600 rounded-full p-1 hover:bg-gray-300 z-50"
                aria-label="チャットを閉じる"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
            <ChatPanel />
          </div>

          {/* Floating Chat Button - モバイルのみ表示 */}
          <FloatingChatButton
            onClick={toggleChat}
            isVisible={isMobile && !isChatVisible}
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;

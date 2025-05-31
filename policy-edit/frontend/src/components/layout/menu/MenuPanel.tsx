import React from "react";
import DirectoryNavigator from "./DirectoryNavigator";

interface MenuPanelProps {
  isOpen: boolean;
  isMobile: boolean;
  children?: React.ReactNode;
}

const MenuPanel: React.FC<MenuPanelProps> = ({
  isOpen,
  isMobile,
}) => {
  return (
    <nav
      className={`
        ${
          isMobile
            ? `fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-300 z-40 transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "w-64 bg-white border-r border-gray-300 h-full"
        }
      `}
      aria-label="ナビゲーションメニュー"
    >
      {/* モバイル版でヘッダーエリア用の透明領域 - クリックイベントを無効化 */}
      {isMobile && <div className="h-16 bg-transparent pointer-events-none" />}

      <div className="p-4">
        <DirectoryNavigator />
      </div>
    </nav>
  );
};

export default MenuPanel;

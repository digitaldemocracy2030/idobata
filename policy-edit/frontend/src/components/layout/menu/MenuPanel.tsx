import React from "react";

interface MenuPanelProps {
  isOpen: boolean;
  isMobile: boolean;
  children?: React.ReactNode;
}

const MenuPanel: React.FC<MenuPanelProps> = ({
  isOpen,
  isMobile,
  children,
}) => {
  return (
    <nav
      className={`
        ${
          isMobile
            ? `fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-300 z-40 transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : "w-64 bg-white border-r border-gray-300 h-full"
        }
      `}
      aria-label="ナビゲーションメニュー"
    >
      <div className="p-4">
        {children || (
          <div className="text-gray-500 text-sm">
            メニューコンテンツは後から追加されます
          </div>
        )}
      </div>
    </nav>
  );
};

export default MenuPanel;

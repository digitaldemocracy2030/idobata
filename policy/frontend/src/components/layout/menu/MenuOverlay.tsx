import React from "react";

interface MenuOverlayProps {
  isVisible: boolean;
  onClick: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ isVisible, onClick }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClick();
    }
  };

  return (
    <div
      className={`fixed inset-0 transition-opacity duration-300 z-40 md:hidden ${
        isVisible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={isVisible ? 0 : -1}
      aria-label="メニューを閉じる"
    >
      {/* ヘッダーエリア（透明） - MenuButtonが見えるように */}
      <div className="absolute top-0 left-0 w-64 h-16 bg-transparent pointer-events-none" />
      {/* メニューエリア（白背景） - ヘッダー下から */}
      <div className="absolute top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white" />
      {/* 残りのエリア（半透明黒背景） - 全画面の高さ */}
      <div className="absolute top-0 left-64 right-0 h-screen bg-black opacity-50" />
    </div>
  );
};

export default MenuOverlay;

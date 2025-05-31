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
      className={`fixed inset-0 bg-black transition-opacity duration-300 z-20 md:hidden ${
        isVisible
          ? "opacity-50 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isVisible ? 0 : -1}
      aria-label="メニューを閉じる"
    />
  );
};

export default MenuOverlay;

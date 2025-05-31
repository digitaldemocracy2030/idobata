import { Menu, X } from "lucide-react";
import React from "react";
import { Button } from "../../ui/button";

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  isOpen,
  onClick,
  className,
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`md:hidden transition-transform duration-200 ${className}`}
      aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <X className="h-6 w-6 transition-transform duration-200" />
      ) : (
        <Menu className="h-6 w-6 transition-transform duration-200" />
      )}
    </Button>
  );
};

export default MenuButton;

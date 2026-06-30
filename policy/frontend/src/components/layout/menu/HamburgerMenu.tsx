import React, { useState } from "react";
import MenuButton from "./MenuButton";
import MenuOverlay from "./MenuOverlay";
import MenuPanel from "./MenuPanel";

interface HamburgerMenuProps {
  children?: React.ReactNode;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // モバイル版専用なので、画面サイズ監視は不要

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <MenuButton isOpen={isOpen} onClick={toggleMenu} />
      <MenuOverlay isVisible={isOpen} onClick={closeMenu} />
      <MenuPanel isOpen={isOpen} isMobile={true}>
        {children}
      </MenuPanel>
    </>
  );
};

export default HamburgerMenu;

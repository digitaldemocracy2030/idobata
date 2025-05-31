import React, { useEffect, useState } from "react";
import MenuButton from "./MenuButton";
import MenuOverlay from "./MenuOverlay";
import MenuPanel from "./MenuPanel";

interface HamburgerMenuProps {
  children?: React.ReactNode;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false); // Close menu when switching to desktop
    }
  }, [isMobile]);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      <MenuButton isOpen={isOpen} onClick={toggleMenu} />
      <MenuOverlay isVisible={isOpen && isMobile} onClick={closeMenu} />
      <MenuPanel isOpen={isOpen} isMobile={isMobile}>
        {children}
      </MenuPanel>
    </>
  );
};

export default HamburgerMenu;

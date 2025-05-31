import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "../../config/siteConfig";
import { cn } from "../../lib/utils";
import HamburgerMenu from "./menu/HamburgerMenu";

interface HeaderProps {
  className?: string;
}

function Header({ className }: HeaderProps): React.ReactElement {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <header
      className={cn(
        "w-full h-16 bg-background border-b-2 border-accent-light",
        "flex items-center justify-between px-4 md:px-6",
        "sticky top-0 z-50",
        className
      )}
    >
      <div className="flex items-center">
        {/* モバイル版のみハンバーガーメニューを表示 */}
        {isMobile && (
          <div className="mr-2">
            <HamburgerMenu>
              <div className="text-gray-500 text-sm">
                メニューコンテンツは後から追加されます
              </div>
            </HamburgerMenu>
          </div>
        )}
        <Link
          to="/"
          className="flex items-center text-xl md:text-xl font-semibold transition-colors"
        >
          {siteConfig.logoUrl && (
            <img
              src={siteConfig.logoUrl}
              alt={`${siteConfig.siteName} ロゴ`}
              className="h-6 md:h-8 w-auto mr-1.5 md:mr-2"
            />
          )}
          <span className="text-lg md:text-xl">{siteConfig.siteName}</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;

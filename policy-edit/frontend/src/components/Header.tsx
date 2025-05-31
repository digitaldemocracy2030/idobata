import { siteConfig } from "@/config/siteConfig";
import { cn } from "@/lib/utils";
import type React from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  className?: string;
}

function Header({ className }: HeaderProps): React.ReactElement {
  return (
    <header
      className={cn(
        "w-full h-16 bg-background border-b-2 border-accent-light",
        "flex items-center px-4 md:px-6",
        "sticky top-0 z-50",
        className
      )}
    >
      <Link
        to="/"
        className="flex items-center text-xl md:text-xl font-semibold text-primary-500 hover:text-primary-600 transition-colors"
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
    </header>
  );
}

export default Header;

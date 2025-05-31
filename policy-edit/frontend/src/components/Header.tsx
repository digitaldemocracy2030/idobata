import type React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

function Header({ className }: HeaderProps): React.ReactElement {
  return (
    <header
      className={cn(
        "w-full h-16 bg-background border-b border-border",
        "flex items-center px-4 md:px-6",
        "sticky top-0 z-50",
        className
      )}
    >
      <Link to="/" className="text-xl font-semibold text-foreground hover:text-foreground/80 transition-colors">
        いどばた政策
      </Link>
    </header>
  );
}

export default Header;

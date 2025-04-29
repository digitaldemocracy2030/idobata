import * as React from "react";
import { Link, type LinkProps } from "react-router-dom";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../base/sheet";

// Navigation-specific sheet component with legacy UI link
const NavigationSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  React.ComponentPropsWithoutRef<typeof SheetContent>
>(({ className, children, ...props }, ref) => (
  <SheetContent ref={ref} className={className} side="left" {...props}>
    {/* Add a visible title for the navigation menu */}
    <SheetTitle className="mb-4">メニュー</SheetTitle>
    {/* Add a description for accessibility */}
    <SheetDescription className="mb-4">
      サイト内のナビゲーションメニューです
    </SheetDescription>
    {children}
    <div className="px-4 py-8 font-bold">
      <NavigationLink
        href="/legacy"
        className="text-md text-blue-600 underline"
      >
        旧UI
      </NavigationLink>
    </div>
  </SheetContent>
));
NavigationSheetContent.displayName = "NavigationSheetContent";

// Custom NavigationLink component that closes the sheet when clicked
interface NavigationLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: React.ReactNode;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({
  href,
  children,
  ...props
}) => {
  return (
    <SheetClose asChild>
      <a href={href} {...props}>
        {children}
      </a>
    </SheetClose>
  );
};

// Custom NavigationRouterLink component that closes the sheet when clicked
// This is for react-router Links
interface NavigationRouterLinkProps extends LinkProps {
  children: React.ReactNode;
}

const NavigationRouterLink: React.FC<NavigationRouterLinkProps> = ({
  children,
  ...props
}) => {
  return (
    <SheetClose asChild>
      <Link {...props}>{children}</Link>
    </SheetClose>
  );
};

// Re-export base components
export {
  Sheet as NavigationSheet,
  SheetTrigger as NavigationSheetTrigger,
  SheetClose as NavigationSheetClose,
  NavigationSheetContent,
  SheetHeader as NavigationSheetHeader,
  SheetFooter as NavigationSheetFooter,
  SheetTitle as NavigationSheetTitle,
  SheetDescription as NavigationSheetDescription,
  NavigationLink,
  NavigationRouterLink,
};

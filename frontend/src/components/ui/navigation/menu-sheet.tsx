import * as React from 'react';
import {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '../base/sheet';

// Navigation-specific sheet component with legacy UI link
const NavigationSheetContent = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  React.ComponentPropsWithoutRef<typeof SheetContent>
>(({ className, children, ...props }, ref) => (
  <SheetContent ref={ref} className={className} side="left" {...props}>
    {/* Add a visible title for the navigation menu */}
    <SheetTitle className="mb-4">メニュー</SheetTitle>
    {/* Add a description for accessibility */}
    <SheetDescription className="mb-4">サイト内のナビゲーションメニューです</SheetDescription>
    <div className="mb-4">
      <a href="/legacy" className="text-sm text-blue-600 hover:underline">
        旧UI
      </a>
    </div>
    {children}
  </SheetContent>
));
NavigationSheetContent.displayName = 'NavigationSheetContent';

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
};

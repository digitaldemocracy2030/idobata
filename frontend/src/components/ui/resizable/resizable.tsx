import * as React from "react";
import { cn } from "../../../lib/utils";

interface ResizableProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical" | "both";
  onResizeStart?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onResize?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onResizeEnd?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}

const Resizable = React.forwardRef<HTMLDivElement, ResizableProps>(
  (
    {
      className,
      direction = "horizontal",
      onResizeStart,
      onResize,
      onResizeEnd,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {children}
        {(direction === "horizontal" || direction === "both") && (
          <div
            className="absolute top-0 left-0 h-full w-1 cursor-ew-resize hover:bg-neutral-300 active:bg-neutral-400 transition-colors"
            onMouseDown={(e) => onResizeStart?.(e)}
          />
        )}
        {(direction === "vertical" || direction === "both") && (
          <div
            className="absolute top-0 left-0 h-1 w-full cursor-ns-resize hover:bg-neutral-300 active:bg-neutral-400 transition-colors"
            onMouseDown={(e) => onResizeStart?.(e)}
          />
        )}
      </div>
    );
  }
);

Resizable.displayName = "Resizable";

export { Resizable };

import { Slot } from "@radix-ui/react-slot"; // 👈 追加
import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            // Figma default
            "bg-[#2D80FF] text-white font-bold text-[20px] rounded-[8px] py-2 px-6 w-auto justify-center items-center hover:bg-[#2566cc]":
              variant === "default" && size === "default",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90":
              variant === "destructive",
            "border border-input bg-background hover:bg-gray-50":
              variant === "outline",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80":
              variant === "secondary",
            "hover:bg-gray-200 hover:text-accent-foreground":
              variant === "ghost",
            "text-foreground underline-offset-4 hover:underline":
              variant === "link",
            // サイズ指定はdefault variantのときは上記で指定済み
            "h-10 px-4 py-2": size === "default" && variant !== "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-4": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };

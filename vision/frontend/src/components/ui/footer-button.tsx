import { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { ButtonProps } from "./button";

interface FooterButtonProps extends Omit<ButtonProps, "variant" | "size"> {
  children: React.ReactNode;
}

const FooterButton = forwardRef<HTMLButtonElement, FooterButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        size="sm"
        className={cn(
          "h-8 px-5 rounded-full border-[#27272A] bg-white hover:bg-gray-50 text-[#27272A] text-xs font-bold tracking-[0.025em]",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

FooterButton.displayName = "FooterButton";

export { FooterButton };

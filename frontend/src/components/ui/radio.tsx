import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const radioVariants = cva(
  "peer h-5 w-5 shrink-0 rounded-full border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
  {
    variants: {
      size: {
        xs: "h-4 w-4",
        sm: "h-5 w-5",
        md: "h-6 w-6",
        lg: "h-7 w-7",
      },
      error: {
        true: "border-destructive",
        false: "",
      },
    },
    defaultVariants: {
      size: "sm",
      error: false,
    },
  }
);

type RadioSize = "xs" | "sm" | "md" | "lg";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: RadioSize;
  error?: boolean;
  label?: string;
  description?: string;
  errorText?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      size = "sm",
      error = false,
      label,
      description,
      errorText,
      ...props
    },
    ref
  ) => {
    return (
      <label className="flex flex-col gap-1 cursor-pointer select-none">
        <span className="flex items-center gap-2">
          <input
            type="radio"
            className={cn(radioVariants({ size, error, className }))}
            ref={ref}
            {...props}
          />
          {label && <span className="font-bold text-sm">{label}</span>}
        </span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
        {errorText && (
          <span className="text-xs text-destructive">{errorText}</span>
        )}
      </label>
    );
  }
);
Radio.displayName = "Radio";

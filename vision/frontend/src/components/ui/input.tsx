import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        xl: "h-12 text-base",
        "2xl": "h-16 text-lg",
      },
      error: {
        true: "border-destructive",
        false: "",
      },
      filled: {
        true: "bg-primary/5",
        false: "",
      },
    },
    defaultVariants: {
      size: "xl",
      error: false,
      filled: false,
    },
  }
);

type InputSize = "xl" | "2xl";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: InputSize;
  error?: boolean;
  filled?: boolean;
  label?: string;
  requiredMark?: boolean;
  helperText?: string;
  errorText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      size = "xl",
      error = false,
      filled = false,
      label,
      requiredMark,
      helperText,
      errorText,
      id,
      ...props
    },
    ref
  ) => {
    // idが未指定の場合は自動生成
    const inputId = id || React.useId();
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="flex items-center gap-1 font-bold text-base"
          >
            {label}
            {requiredMark && <span className="text-destructive">*</span>}
          </label>
        )}
        <input
          id={inputId}
          className={cn(inputVariants({ size, error, filled, className }))}
          ref={ref}
          {...props}
        />
        {helperText && (
          <span className="text-xs text-muted-foreground">{helperText}</span>
        )}
        {errorText && (
          <span className="text-xs text-destructive">{errorText}</span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

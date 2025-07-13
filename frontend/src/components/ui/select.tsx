import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const selectVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
  {
    variants: {
      size: {
        xs: "h-8 text-xs",
        lg: "h-12 text-base",
      },
      error: {
        true: "border-destructive",
        false: "",
      },
      disabled: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      size: "lg",
      error: false,
      disabled: false,
    },
  }
);

type SelectSize = "xs" | "lg";

export interface SelectProps
  extends Omit<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "size" | "disabled"
  > {
  size?: SelectSize;
  error?: boolean;
  disabled?: boolean;
  label?: string;
  requiredMark?: boolean;
  helperText?: string;
  errorText?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      size = "lg",
      error = false,
      disabled = false,
      label,
      requiredMark,
      helperText,
      errorText,
      options,
      id,
      ...props
    },
    ref
  ) => {
    // idが未指定の場合は自動生成
    const selectId = id || React.useId();
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="flex items-center gap-1 font-bold text-base"
          >
            {label}
            {requiredMark && <span className="text-destructive">*</span>}
          </label>
        )}
        <select
          id={selectId}
          className={cn(selectVariants({ size, error, disabled, className }))}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
Select.displayName = "Select";

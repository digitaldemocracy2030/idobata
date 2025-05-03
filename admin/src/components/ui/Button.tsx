import React from "react";
import type { ButtonHTMLAttributes, FC, ReactNode } from "react";
import { Button as ShadcnButton } from "./shadcn-button";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "warning" | "success" | "info";
}

const variantMapping = {
  primary: "default",
  secondary: "secondary",
  danger: "destructive",
  warning: "outline",
  success: "outline",
  info: "outline",
} as const;

const Button: FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className,
  ...props
}) => {
  const mappedVariant = variantMapping[variant] || "default";
  let customStyle = "";
  if (variant === "warning") {
    customStyle = "border-warning text-warning-foreground hover:bg-warning/20";
  } else if (variant === "success") {
    customStyle = "border-success text-success-foreground hover:bg-success/20";
  } else if (variant === "info") {
    customStyle = "border-info text-info-foreground hover:bg-info/20";
  }

  return (
    <ShadcnButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={mappedVariant}
      className={customStyle ? `${customStyle} ${className || ""}` : className}
      {...props}
    >
      {children}
    </ShadcnButton>
  );
};

export default Button;

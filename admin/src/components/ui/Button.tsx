import React from "react";
import type { FC, ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "warning" | "success" | "info";
}

const Button: FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
}) => {
  const baseStyles = "px-4 py-2 rounded font-medium focus:outline-none";

  const variantStyles = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50",
    danger:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50",
    warning:
      "bg-warning text-warning-foreground hover:bg-warning/90 disabled:opacity-50",
    success:
      "bg-success text-success-foreground hover:bg-success/90 disabled:opacity-50",
    info: "bg-info text-info-foreground hover:bg-info/90 disabled:opacity-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]}`}
    >
      {children}
    </button>
  );
};

export default Button;

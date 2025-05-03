import React from "react";
import type { FC, ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
  type?: "success" | "error" | "warning" | "info";
}

const Alert: FC<AlertProps> = ({ children, type = "info" }) => {
  const typeStyles = {
    success: "bg-success/20 text-success-foreground",
    error: "bg-destructive/20 text-destructive-foreground",
    warning: "bg-warning/20 text-warning-foreground",
    info: "bg-info/20 text-info-foreground",
  };

  return (
    <div className={`p-4 rounded mb-4 ${typeStyles[type]}`}>{children}</div>
  );
};

export default Alert;

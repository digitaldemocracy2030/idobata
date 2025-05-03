import React from "react";
import type { FC, ReactNode } from "react";
import {
  Alert as ShadcnAlert,
  AlertDescription,
} from "./shadcn-alert";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface AlertProps {
  children: ReactNode;
  type?: "success" | "error" | "warning" | "info";
}

const Alert: FC<AlertProps> = ({ children, type = "info" }) => {
  const getIcon = () => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4" />;
      case "error": return <AlertCircle className="h-4 w-4" />;
      case "warning": return <AlertTriangle className="h-4 w-4" />;
      case "info": return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getVariant = () => type === "error" ? "destructive" : "default";
  
  const getClassName = () => {
    switch (type) {
      case "success": return "border-success bg-success/10 text-success-foreground";
      case "warning": return "border-warning bg-warning/10 text-warning-foreground";
      case "info": return "border-info bg-info/10 text-info-foreground";
      default: return "";
    }
  };

  return (
    <ShadcnAlert variant={getVariant()} className={`mb-4 ${getClassName()}`}>
      {getIcon()}
      <AlertDescription>{children}</AlertDescription>
    </ShadcnAlert>
  );
};

export default Alert;

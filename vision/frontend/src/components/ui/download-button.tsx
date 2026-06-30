import { Download } from "lucide-react";
import type React from "react";

interface DownloadButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  children,
  onClick,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 bg-white border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors font-bold text-sm md:text-base ${className}`}
    >
      <Download className="w-5 h-5 md:w-6 md:h-6" />
      {children}
    </button>
  );
};

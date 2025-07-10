// src/components/ErrorDisplay.tsx
import type React from "react";
import { formatUserErrorMessage } from "../../lib/errorUtils";

interface ErrorDisplayProps {
  error: Error | null; // Accept Error object or null
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) {
    return null; // Don't render anything if there's no error
  }

  const displayMessage = formatUserErrorMessage(error.message);

  return (
    <div
      className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-100 border border-red-300"
      role="alert"
    >
      {displayMessage}
    </div>
  );
};

export default ErrorDisplay;

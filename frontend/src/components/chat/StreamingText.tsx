import type React from "react";
import { useEffect, useState } from "react";

interface StreamingTextProps {
  content: string;
  speed?: number;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  content,
  speed = 30,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + content[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [content, currentIndex, speed]);

  return (
    <>
      {displayedText}
      {currentIndex < content.length && (
        <span className="inline-block w-2 h-4 bg-current opacity-75 animate-pulse" />
      )}
    </>
  );
};

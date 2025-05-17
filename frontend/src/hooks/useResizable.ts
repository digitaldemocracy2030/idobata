import { useCallback, useEffect, useState } from "react";

interface ResizableOptions {
  minWidth: number | string;
  maxWidth: number | string;
  initialWidth: number | string;
}

export const useResizable = (options: ResizableOptions) => {
  const [width, setWidth] = useState(options.initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleResizeStart = useCallback((clientX: number) => {
    setIsResizing(true);
    setStartX(clientX);
  }, []);

  const handleResize = useCallback(
    (clientX: number) => {
      if (!isResizing) return;

      const deltaX = clientX - startX;

      const currentWidth =
        typeof width === "string" && width.endsWith("%")
          ? Number.parseFloat(width)
          : typeof width === "number"
            ? width
            : Number.parseFloat(String(width));

      const minWidthNum =
        typeof options.minWidth === "string" && options.minWidth.endsWith("%")
          ? Number.parseFloat(options.minWidth)
          : typeof options.minWidth === "number"
            ? options.minWidth
            : Number.parseFloat(String(options.minWidth));

      const maxWidthNum =
        typeof options.maxWidth === "string" && options.maxWidth.endsWith("%")
          ? Number.parseFloat(options.maxWidth)
          : typeof options.maxWidth === "number"
            ? options.maxWidth
            : Number.parseFloat(String(options.maxWidth));

      const viewportWidth = window.innerWidth;
      const pixelDelta = (deltaX / viewportWidth) * 100; // Convert to percentage

      let newWidth = currentWidth - pixelDelta; // Subtract because we're resizing from right edge

      newWidth = Math.min(Math.max(minWidthNum, newWidth), maxWidthNum);

      setWidth(`${newWidth}%`);
      setStartX(clientX);
    },
    [isResizing, startX, width, options.minWidth, options.maxWidth]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleResize(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleResize(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => {
      handleResizeEnd();
    };

    const handleTouchEnd = () => {
      handleResizeEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleResize, handleResizeEnd, isResizing]);

  return {
    width,
    setWidth,
    isResizing,
    handleResizeStart,
  };
};

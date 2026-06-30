import { useCallback, useEffect, useState } from "react";

interface DraggableOptions {
  minHeight: number;
  maxHeight: number;
  initialHeight: number;
}

export const useDraggable = (options: DraggableOptions) => {
  const [height, setHeight] = useState(options.initialHeight);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
  }, []);

  const handleDrag = useCallback(
    (clientY: number) => {
      if (!isDragging) return;

      const deltaY = startY - clientY;
      const newHeight = Math.min(
        Math.max(options.minHeight, height + deltaY),
        options.maxHeight
      );

      setHeight(newHeight);
      setStartY(clientY);
    },
    [isDragging, startY, height, options.minHeight, options.maxHeight]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDrag(e.touches[0].clientY);
      }
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    const handleTouchEnd = () => {
      handleDragEnd();
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
  }, [handleDrag, handleDragEnd, isDragging]);

  return {
    height,
    setHeight,
    isDragging,
    handleDragStart,
  };
};

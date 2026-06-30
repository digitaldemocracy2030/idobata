import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../../lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const getTransform = (placement: string) => {
  switch (placement) {
    case "top":
      return "translateX(-50%) translateY(-100%)";
    case "bottom":
      return "translateX(-50%)";
    case "left":
      return "translateX(-100%) translateY(-50%)";
    case "right":
      return "translateY(-50%)";
    default:
      return "translateX(-50%)";
  }
};

const getArrowClasses = (placement: string) => {
  switch (placement) {
    case "top":
      return "border-l-[6px] border-r-[6px] border-t-[6px] border-t-zinc-700 top-full left-1/2 transform -translate-x-1/2";
    case "bottom":
      return "border-l-[6px] border-r-[6px] border-b-[6px] border-b-zinc-700 -top-[6px] left-1/2 transform -translate-x-1/2";
    case "left":
      return "border-t-[6px] border-b-[6px] border-l-[6px] border-l-zinc-700 left-full top-1/2 transform -translate-y-1/2";
    case "right":
      return "border-t-[6px] border-b-[6px] border-r-[6px] border-r-zinc-700 -left-[6px] top-1/2 transform -translate-y-1/2";
    default:
      return "border-l-[6px] border-r-[6px] border-b-[6px] border-b-zinc-700 -top-[6px] left-1/2 transform -translate-x-1/2";
  }
};

const Tooltip = ({
  children,
  content,
  placement = "top",
  className,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      let x = rect.left + rect.width / 2;
      let y = rect.top;

      if (placement === "top") {
        y = rect.top - 8;
      } else if (placement === "bottom") {
        y = rect.bottom + 8;
      } else if (placement === "left") {
        x = rect.left - 8;
        y = rect.top + rect.height / 2;
      } else if (placement === "right") {
        x = rect.right + 8;
        y = rect.top + rect.height / 2;
      }

      setPosition({ x, y });
    }
  }, [placement]);

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!isVisible) {
      updatePosition();
    }
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      if (isVisible) {
        updatePosition();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isVisible, updatePosition]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e);
          }
        }}
        type="button"
        aria-label="Show tooltip"
        aria-expanded={isVisible}
        aria-describedby={isVisible ? "tooltip-content" : undefined}
        className={cn(
          "cursor-pointer transition-colors duration-200 border-none bg-transparent",
          isVisible ? "bg-black/[0.06] rounded-lg px-2 py-1" : "px-2 py-1",
          className
        )}
      >
        {children}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          id="tooltip-content"
          role="tooltip"
          className="fixed z-50"
          style={{
            left: position.x,
            top: position.y,
            transform: getTransform(placement),
          }}
        >
          <div className="relative bg-zinc-700 text-white text-xs font-bold leading-[2em] tracking-[0.025em] px-3 py-2 rounded shadow-lg max-w-[230px]">
            {content}
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-0 h-0 border-solid border-transparent",
                getArrowClasses(placement)
              )}
            />
          </div>
        </div>
      )}
    </>
  );
};

export { Tooltip };

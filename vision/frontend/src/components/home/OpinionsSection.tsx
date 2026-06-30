import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Opinion } from "../../types";
import OpinionCard from "./OpinionCard";

interface OpinionsSectionProps {
  opinions: Opinion[];
}

const OpinionsSection = ({ opinions }: OpinionsSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cardWidth = container.querySelector("div")?.offsetWidth || 0;
    const gap = 24; // 6 * 4px (gap-6)
    const scrollAmount = cardWidth + gap;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const checkScrollButtons = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollButtons);
    checkScrollButtons();

    return () => {
      container.removeEventListener("scroll", checkScrollButtons);
    };
  }, [opinions, checkScrollButtons]);

  return (
    <section className="pt-8">
      <div className="pl-8 md:pl-16 w-full">
        <div className="mb-4 text-center">
          <div className="flex items-center justify-start gap-4 mb-4">
            <img
              src="/images/home-recent-opitnions.png"
              alt="新着の意見"
              className="w-10 h-10"
            />
            <h2 className="text-2xl font-bold text-gray-900">新着の意見</h2>
          </div>
        </div>

        <div className="relative w-full mx-auto">
          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              type="button"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full shadow-lg p-2 hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full shadow-lg p-2 hover:shadow-xl transition-shadow"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {/* Cards container */}
          <div
            ref={containerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory px-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {opinions.map((opinion) => (
              <div key={opinion.id} className="flex-none w-[280px] snap-center">
                <OpinionCard {...opinion} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpinionsSection;

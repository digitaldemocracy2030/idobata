import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/card";

interface FeaturedQuestion {
  id: string;
  title: string;
  description: string;
  participantCount: number;
  commentCount: number;
  trend?: "up" | "down" | "stable";
  themeId?: string;
  tags?: string[];
  tagLine?: string;
}

interface FeaturedQuestionsSectionProps {
  questions: FeaturedQuestion[];
}

const FeaturedQuestionsSection = ({
  questions,
}: FeaturedQuestionsSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const cardWidth =
      container.querySelector(".featured-card")?.getBoundingClientRect()
        .width || 0;
    const gap = 24;
    const scrollAmount = cardWidth + gap;

    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const checkScrollButtons = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScrollButtons);
    checkScrollButtons();

    return () => container.removeEventListener("scroll", checkScrollButtons);
  }, [questions]);

  return (
    <section className="pt-8">
      <div className="pl-8 md:pl-16">
        <div className="mb-4 text-center">
          <div className="flex items-center justify-start gap-4 mb-4">
            <img
              src="/images/home-popular-themes.png"
              alt="注目のお題"
              className="w-10 h-10"
            />
            <h2 className="text-2xl font-bold text-gray-900">注目のお題</h2>
          </div>
        </div>

        <div className="relative mx-auto px-4">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              type="button"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full shadow-lg p-2 hover:shadow-xl transition-shadow"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full shadow-lg p-2 hover:shadow-xl transition-shadow"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          )}

          <div
            ref={containerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {questions.map((question) => {
              return (
                <div
                  key={question.id}
                  className="featured-card flex-none w-[280px] h-[300px] snap-center"
                >
                  <Card className="border p-4 border-blue-400 rounded-lg hover:shadow-sm transition-all duration-200 bg-white overflow-hidden h-full">
                    <Link
                      to={
                        question.themeId
                          ? `/themes/${question.themeId}/questions/${question.id}`
                          : `/sharp-questions/${question.id}`
                      }
                      className="block h-full"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex-1 p-0">
                          <h3 className="font-bold text-base text-gray-900 mb-3 leading-tight">
                            {question.description}
                          </h3>

                          <p className="text-sm text-gray-600 leading-relaxed">
                            {question.title}
                          </p>
                        </div>

                        <div className="p-0">
                          {question.tags && question.tags.length > 0 && (
                            <div className="flex gap-1 mb-3">
                              {question.tags.map((tag) => (
                                <span
                                  key={`tag-${tag}`}
                                  className="inline-block px-2 py-1 rounded-full text-xs text-gray-400 border border-gray-400 font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-end">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mr-4">
                              <div className="flex items-center gap-1">
                                <span>参加人数</span>
                                <span className="font-bold text-base text-gray-900">
                                  {question.participantCount}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>意見抽出数</span>
                                <span className="font-bold text-base text-gray-900">
                                  {question.commentCount}
                                </span>
                              </div>
                            </div>

                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              aria-label="詳細を見る"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              role="img"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedQuestionsSection;

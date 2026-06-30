import { useRef } from "react";
import { Link } from "react-router-dom";
import { Card } from "../ui/card";

interface Question {
  id: string;
  category: string;
  title: string;
  questionText?: string;
  postCount: number;
  lastUpdated: string;
  themeId?: string;
  tagLine?: string;
  description?: string;
  participantCount?: number;
  commentCount?: number;
}

interface QuestionsTableProps {
  questions: Question[];
}

const QuestionsTable = ({ questions }: QuestionsTableProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-8">
      <div className="px-8 md:px-16">
        <div className="mb-4 text-center">
          <div className="flex items-center justify-start gap-4 mb-4">
            <img
              src="/images/home-themes.png"
              alt="お題リスト"
              className="w-10 h-10"
            />
            <h2 className="text-2xl font-bold text-gray-900">お題リスト</h2>
          </div>
        </div>

        <div className="mx-auto">
          <div
            ref={containerRef}
            className="flex flex-col gap-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {questions.map((question) => {
              return (
                <Link
                  key={question.id}
                  to={`/themes/${question.themeId}/questions/${question.id}`}
                  className="question-item block"
                >
                  <Card className="md:h-[60px] h-auto p-0 border border-blue-400 rounded-lg hover:shadow-sm transition-all duration-200 bg-blue-50">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between h-full">
                      <div className="w-full md:w-[70%] p-4">
                        <h3 className="font-bold text-base text-gray-900">
                          {question.description}
                        </h3>
                      </div>
                      <div className="w-full md:w-[30%] flex items-center justify-between text-xs text-gray-600 bg-white p-4 md:h-full rounded-b-lg md:rounded-b-none md:rounded-r-lg">
                        <div className="flex items-center gap-2 md:gap-4">
                          <div className="flex items-center gap-1">
                            <span>参加人数</span>
                            <span className="font-bold text-base text-gray-900">
                              {question.participantCount}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>抽出意見数</span>
                            <span className="font-bold text-base text-gray-900">
                              {question.commentCount}
                            </span>
                          </div>
                        </div>
                        <svg
                          className="w-4 h-4 text-blue-600"
                          aria-label="詳細を見る"
                          fill="none"
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
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuestionsTable;

import { useState } from "react";
import { useParams } from "react-router-dom";
import BreadcrumbView from "../components/common/BreadcrumbView";
import OpinionCard from "../components/question/OpinionCard";
import { Button } from "../components/ui/button";
import { useQuestionDetail } from "../hooks/useQuestionDetail";

const CommentsPage = () => {
  const { themeId, qId } = useParams<{ themeId: string; qId: string }>();
  const [activeTab, setActiveTab] = useState<"issues" | "solutions">("issues");
  
  const { questionDetail, isLoading, error } = useQuestionDetail(
    themeId || "",
    qId || ""
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p>コメントを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (questionDetail) {
    const breadcrumbItems = [
      { label: "TOP", href: "/" },
      { label: "テーマ一覧", href: "/themes" },
      {
        label: "テーマ詳細",
        href: `/themes/${themeId}`,
      },
      {
        label: questionDetail.question.questionText,
        href: `/themes/${themeId}/questions/${qId}`,
      },
      {
        label: "コメント一覧",
        href: `/themes/${themeId}/questions/${qId}/comments`,
      },
    ];

    const opinions = {
      issues: questionDetail.relatedProblems.map((p) => ({
        id: p._id,
        text: p.statement,
        relevance: Math.round(p.relevanceScore * 100) || 0,
      })),
      solutions: questionDetail.relatedSolutions.map((s) => ({
        id: s._id,
        text: s.statement,
        relevance: Math.round(s.relevanceScore * 100) || 0,
      })),
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbView items={breadcrumbItems} />
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">コメント一覧</h1>
            <Button
              variant="outline"
              size="sm"
              className="text-sm"
              onClick={() => window.history.back()}
            >
              質問ページに戻る
            </Button>
          </div>

          <div className="flex border-b border-neutral-200 mb-4">
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === "issues" ? "border-b-2 border-purple-500 text-purple-700" : "text-neutral-500"}`}
              onClick={() => setActiveTab("issues")}
              type="button"
            >
              課題点 ({opinions.issues.length})
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${activeTab === "solutions" ? "border-b-2 border-purple-500 text-purple-700" : "text-neutral-500"}`}
              onClick={() => setActiveTab("solutions")}
              type="button"
            >
              解決策 ({opinions.solutions.length})
            </button>
          </div>

          <div className="space-y-3">
            {activeTab === "issues"
              ? opinions.issues.map((issue) => (
                  <OpinionCard
                    key={issue.id}
                    text={issue.text}
                    type="課題点"
                    relevance={issue.relevance || 0}
                  />
                ))
              : opinions.solutions.map((solution) => (
                  <OpinionCard
                    key={solution.id}
                    text={solution.text}
                    type="解決策"
                    relevance={solution.relevance || 0}
                  />
                ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-8">
        <p>コメントを表示できません。</p>
      </div>
    </div>
  );
};

export default CommentsPage;

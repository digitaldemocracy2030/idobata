import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../services/api/apiClient";

const ReportExampleManagement = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState({});
  const [generatingDebateAnalysis, setGeneratingDebateAnalysis] = useState({});
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    if (!themeId) return;

    setLoading(true);
    const result = await apiClient.getQuestionsByTheme(themeId);

    if (result.isErr()) {
      console.error("Failed to fetch questions:", result.error);
      setError("質問の読み込みに失敗しました");
      setLoading(false);
      return;
    }

    setQuestions(result.value);
    setLoading(false);
  };

  const handleGenerateReport = async (questionId) => {
    setGenerating((prev) => ({ ...prev, [questionId]: true }));
    setSuccessMessage(null);
    setError(null);

    try {
      const result = await apiClient.generateReportExample(themeId, questionId);

      if (result.isErr()) {
        console.error("Failed to generate report:", result.error);
        setError("レポート例の生成に失敗しました");
      } else {
        setSuccessMessage(
          "レポート例の生成を開始しました。生成には数分かかる場合があります。"
        );
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setError("レポート例の生成中にエラーが発生しました");
    }

    setGenerating((prev) => ({ ...prev, [questionId]: false }));
  };

  const handleGenerateDebateAnalysis = async (questionId) => {
    setGeneratingDebateAnalysis((prev) => ({ ...prev, [questionId]: true }));
    setSuccessMessage(null);
    setError(null);

    try {
      const result = await apiClient.generateDebateAnalysis(
        themeId,
        questionId
      );

      if (result.isErr()) {
        console.error("Failed to generate debate analysis:", result.error);
        setError("議論分析の生成に失敗しました");
      } else {
        setSuccessMessage(
          "議論分析の生成を開始しました。生成には数分かかる場合があります。"
        );
      }
    } catch (error) {
      console.error("Error generating debate analysis:", error);
      setError("議論分析の生成中にエラーが発生しました");
    }

    setGeneratingDebateAnalysis((prev) => ({ ...prev, [questionId]: false }));
  };

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">市民意見レポート例の管理</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="mb-4">
        <button
          type="button"
          onClick={() => navigate(`/themes/${themeId}`)}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
        >
          テーマ編集に戻る
        </button>
      </div>

      <div className="bg-background p-4 rounded-lg border border-border">
        <h2 className="text-lg font-semibold mb-4">質問一覧</h2>
        {questions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            このテーマにはまだ質問がありません
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question._id}
                className="p-4 border border-border rounded-lg"
              >
                <h3 className="font-medium mb-2">{question.questionText}</h3>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateReport(question._id)}
                    disabled={generating[question._id]}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                  >
                    {generating[question._id]
                      ? "生成中..."
                      : "市民意見レポート例を生成"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerateDebateAnalysis(question._id)}
                    disabled={generatingDebateAnalysis[question._id]}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 disabled:opacity-50"
                  >
                    {generatingDebateAnalysis[question._id]
                      ? "生成中..."
                      : "議論分析を生成"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportExampleManagement;

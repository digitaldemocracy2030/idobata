import React, { useState, useEffect } from "react";
import type { ChangeEvent, FC, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../services/api/apiClient";
import { ApiErrorType } from "../../services/api/apiError";
import type {
  CreateThemePayload,
  Problem,
  Question,
  Theme,
  UpdateThemePayload,
} from "../../services/api/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ThemeFormProps {
  theme?: Theme;
  isEdit?: boolean;
}

const ThemeForm: FC<ThemeFormProps> = ({ theme, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<
    CreateThemePayload | UpdateThemePayload
  >({
    title: "",
    description: "",
    slug: "",
    isActive: true,
    customPrompt: "",
    starterQuestions: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingReports, setIsGeneratingReports] = useState<
    Record<string, boolean>
  >({});
  const [isGeneratingDebateAnalysis, setIsGeneratingDebateAnalysis] = useState<
    Record<string, boolean>
  >({});
  const [isGeneratingVisualReport, setIsGeneratingVisualReport] =
    useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && theme) {
      setFormData({
        title: theme.title,
        description: theme.description || "",
        slug: theme.slug,
        isActive: theme.isActive,
        customPrompt: theme.customPrompt || "",
        starterQuestions: theme.starterQuestions || [],
      });
    }
  }, [isEdit, theme]);

  useEffect(() => {
    if (isEdit && theme?._id) {
      fetchQuestions(theme._id);
    }
  }, [isEdit, theme?._id]);

  const fetchQuestions = async (themeId: string) => {
    setIsLoadingQuestions(true);
    setQuestionsError(null);

    const result = await apiClient.getQuestionsByTheme(themeId);

    if (result.isErr()) {
      console.error("Failed to fetch questions:", result.error);
      setQuestionsError("シャープな問いの読み込みに失敗しました。");
      setIsLoadingQuestions(false);
      return;
    }

    setQuestions(result.value);
    setIsLoadingQuestions(false);
  };

  const handleGenerateQuestions = async () => {
    if (!theme?._id) return;

    setIsGeneratingQuestions(true);
    setQuestionsError(null);
    setSuccessMessage(null);

    const result = await apiClient.generateQuestions(theme._id);

    if (result.isErr()) {
      console.error("Failed to generate questions:", result.error);
      setQuestionsError("シャープな問いの生成に失敗しました。");
      setIsGeneratingQuestions(false);
      return;
    }

    setSuccessMessage(
      "シャープな問いの生成を開始しました。しばらくすると問いリストに表示されます。"
    );

    setTimeout(() => {
      fetchQuestions(theme._id);
    }, 5000);

    setIsGeneratingQuestions(false);
  };

  const handleGenerateVisualReport = async () => {
    if (!theme?._id || !selectedQuestionId) return;

    setIsGeneratingVisualReport(true);
    setQuestionsError(null);
    setSuccessMessage(null);

    const result = await apiClient.generateVisualReport(
      theme._id,
      selectedQuestionId
    );

    if (result.isErr()) {
      console.error("Failed to generate visual report:", result.error);
      setQuestionsError("ビジュアルレポートの生成に失敗しました。");
      setIsGeneratingVisualReport(false);
      return;
    }

    setSuccessMessage(
      "ビジュアルレポートの生成を開始しました。しばらくすると問いの詳細画面で確認できます。"
    );

    setIsGeneratingVisualReport(false);
  };

  const handleGenerateReport = async (
    questionId: string,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }

    if (!theme?._id) return;

    setIsGeneratingReports((prev) => ({ ...prev, [questionId]: true }));
    setQuestionsError(null);
    setSuccessMessage(null);

    const result = await apiClient.generateReportExample(theme._id, questionId);

    if (result.isErr()) {
      console.error("Failed to generate report:", result.error);
      setQuestionsError("市民意見レポート例の生成に失敗しました。");
      setIsGeneratingReports((prev) => ({ ...prev, [questionId]: false }));
      return;
    }

    setSuccessMessage(
      "市民意見レポート例の生成を開始しました。生成には数分かかる場合があります。"
    );
    setIsGeneratingReports((prev) => ({ ...prev, [questionId]: false }));
  };

  const handleGenerateDebateAnalysis = async (
    questionId: string,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }

    if (!theme?._id) return;

    setIsGeneratingDebateAnalysis((prev) => ({ ...prev, [questionId]: true }));
    setQuestionsError(null);
    setSuccessMessage(null);

    const result = await apiClient.generateDebateAnalysis(
      theme._id,
      questionId
    );

    if (result.isErr()) {
      console.error("Failed to generate debate analysis:", result.error);
      setQuestionsError("議論分析の生成に失敗しました。");
      setIsGeneratingDebateAnalysis((prev) => ({
        ...prev,
        [questionId]: false,
      }));
      return;
    }

    setSuccessMessage(
      "議論分析の生成を開始しました。生成には数分かかる場合があります。"
    );
    setIsGeneratingDebateAnalysis((prev) => ({
      ...prev,
      [questionId]: false,
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleToggleVisibility = () => {
    alert("未実装です。");
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title) {
      newErrors.title = "タイトルは必須です";
    }

    if (!formData.slug) {
      newErrors.slug = "スラッグは必須です";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug as string)) {
      newErrors.slug = "スラッグは小文字、数字、ハイフンのみ使用できます";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    if (isEdit && theme) {
      const result = await apiClient.updateTheme(theme._id, formData);

      result.match(
        () => {
          navigate("/themes");
        },
        (error) => {
          console.error("Form submission error:", error);

          if (error.type === ApiErrorType.VALIDATION_ERROR) {
            setErrors({ form: error.message });
          } else {
            alert(`エラーが発生しました: ${error.message}`);
          }
        }
      );
    } else {
      const result = await apiClient.createTheme(
        formData as CreateThemePayload
      );

      result.match(
        () => {
          navigate("/themes");
        },
        (error) => {
          console.error("Form submission error:", error);

          if (error.type === ApiErrorType.VALIDATION_ERROR) {
            setErrors({ form: error.message });
          } else {
            alert(`エラーが発生しました: ${error.message}`);
          }
        }
      );
    }

    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-8xl">
      {errors.form && (
        <div className="bg-destructive/20 text-destructive-foreground p-4 rounded mb-4">
          {errors.form}
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-foreground font-medium mb-2"
        >
          タイトル
          <span className="text-destructive ml-1">*</span>
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title as string}
          onChange={handleChange}
          className={errors.title ? "border-destructive" : ""}
        />
        {errors.title && (
          <p className="text-destructive text-sm mt-1">{errors.title}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="description"
          className="block text-foreground font-medium mb-2"
        >
          説明
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          rows={4}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="slug"
          className="block text-foreground font-medium mb-2"
        >
          スラッグ
          <span className="text-destructive ml-1">*</span>
        </label>
        <Input
          id="slug"
          name="slug"
          value={formData.slug as string}
          onChange={handleChange}
          className={errors.slug ? "border-destructive" : ""}
          placeholder="例: my-theme-slug"
        />
        {errors.slug && (
          <p className="text-destructive text-sm mt-1">{errors.slug}</p>
        )}
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive as boolean}
          onChange={handleChange}
          className="mr-2"
        />
        <label htmlFor="isActive" className="text-foreground">
          アクティブ
        </label>
      </div>

      <div className="mb-4">
        <label
          htmlFor="customPrompt"
          className="block text-foreground font-medium mb-2"
        >
          AI プロンプト
          <span className="text-muted-foreground ml-1 text-sm">(省略可)</span>
        </label>
        <textarea
          id="customPrompt"
          name="customPrompt"
          value={(formData.customPrompt as string) || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          rows={8}
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="starterQuestions"
          className="block text-foreground font-medium mb-2"
        >
          スターター質問
          <span className="text-muted-foreground ml-1 text-sm">
            (1行に1つずつ入力してください。質問内で改行するには Shift+Enter
            を使用)
          </span>
        </label>
        <textarea
          id="starterQuestions"
          name="starterQuestions"
          value={((formData.starterQuestions as string[]) || []).join("\n")}
          onChange={(e) => {
            const questions = e.target.value
              .split("\n")
              .filter((q) => q.trim() !== "");
            setFormData((prev) => ({ ...prev, starterQuestions: questions }));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
              e.preventDefault();
              const textarea = e.target as HTMLTextAreaElement;
              const { selectionStart, selectionEnd, value } = textarea;
              const newValue = `${value.substring(0, selectionStart)}\n${value.substring(selectionEnd)}`;

              textarea.value = newValue;

              const newCursorPos = selectionStart + 1;
              textarea.selectionStart = newCursorPos;
              textarea.selectionEnd = newCursorPos;

              const event = new Event("input", { bubbles: true });
              textarea.dispatchEvent(event);
            }
          }}
          className="w-full px-3 py-2 border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
          rows={5}
          placeholder="例: このテーマについて議論したいことは何ですか？&#10;あなたの意見を教えてください。&#10;このテーマに対する課題は何だと思いますか？"
        />
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "送信中..." : isEdit ? "更新" : "作成"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/themes")}
        >
          キャンセル
        </Button>
      </div>

      {/* Sharp Questions Section - Only show in edit mode */}
      {isEdit && theme?._id && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            このテーマに紐づくシャープな問い
          </h2>

          {questionsError && (
            <div className="mb-4 p-4 bg-destructive/20 border border-destructive/30 rounded-lg text-destructive-foreground text-sm">
              <p className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-label="エラーアイコン"
                  role="img"
                >
                  <title>エラーアイコン</title>
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {questionsError}
              </p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-success/80 border border-success/90 rounded-lg text-success-foreground text-sm">
              <p className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-label="成功アイコン"
                  role="img"
                >
                  <title>成功アイコン</title>
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {successMessage}
              </p>
            </div>
          )}

          {/* Generation Button */}
          <div className="mb-6 p-4 bg-background rounded-lg border border-border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-primary-dark mb-1">
                  シャープな問い生成
                </h3>
                <p className="text-sm text-muted-foreground">
                  課題データから新しいシャープな問いを生成します
                </p>
              </div>
              <button
                onClick={handleGenerateQuestions}
                disabled={isGeneratingQuestions}
                className="btn bg-primary text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm whitespace-nowrap hover:bg-primary/90"
                type="button"
              >
                {isGeneratingQuestions ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-label="読み込み中"
                      role="img"
                    >
                      <title>読み込み中</title>
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    生成中...
                  </span>
                ) : questions.length === 0 ? (
                  "生成する"
                ) : (
                  "さらに生成する"
                )}
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="bg-background p-4 rounded-lg border border-border shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-primary-dark">
              シャープな問い一覧 ({questions.length})
            </h3>
            {isLoadingQuestions ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-pulse-slow flex space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
              </div>
            ) : questions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        見出し
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        問い
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        関連するproblem
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        作成日時
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        表示
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        イラストまとめ
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        論点まとめ
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        市民意見レポート
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {questions.map((question) => (
                      <tr
                        key={question._id}
                        className={`hover:bg-muted/50 cursor-pointer ${selectedQuestionId === question._id ? "bg-muted/30" : ""}`}
                        onClick={() => setSelectedQuestionId(question._id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedQuestionId(question._id);
                          }
                        }}
                        tabIndex={0}
                        aria-selected={selectedQuestionId === question._id}
                      >
                        <td className="px-6 py-4 whitespace-normal text-sm text-foreground font-medium">
                          {question.tagLine}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-foreground">
                          {question.questionText}
                          {question.tags && question.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {question.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="border bg-primary-100 text-primary-800 rounded-full px-2 py-0.5 text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-muted-foreground">
                          {/* We would fetch related problems here in a real implementation */}
                          <span className="text-muted-foreground italic">
                            関連データは取得中...
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(question.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVisibility();
                            }}
                            className="px-3 py-1 bg-success/20 text-success-foreground rounded-full text-xs font-medium"
                            type="button"
                          >
                            表示
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedQuestionId(question._id);
                              handleGenerateVisualReport();
                            }}
                            disabled={isGeneratingVisualReport}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                            type="button"
                          >
                            {isGeneratingVisualReport &&
                            selectedQuestionId === question._id ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin -ml-1 mr-1 h-3 w-3"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  aria-label="読み込み中"
                                  role="img"
                                >
                                  <title>読み込み中</title>
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                生成中
                              </span>
                            ) : (
                              "更新する"
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateDebateAnalysis(question._id, e);
                            }}
                            disabled={isGeneratingDebateAnalysis[question._id]}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                            type="button"
                          >
                            {isGeneratingDebateAnalysis[question._id] ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin -ml-1 mr-1 h-3 w-3"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  aria-label="読み込み中"
                                  role="img"
                                >
                                  <title>読み込み中</title>
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                生成中
                              </span>
                            ) : (
                              "更新する"
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateReport(question._id, e);
                            }}
                            disabled={isGeneratingReports[question._id]}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                            type="button"
                          >
                            {isGeneratingReports[question._id] ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin -ml-1 mr-1 h-3 w-3"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  aria-label="読み込み中"
                                  role="img"
                                >
                                  <title>読み込み中</title>
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                生成中
                              </span>
                            ) : (
                              "更新する"
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                <p>まだ問いが生成されていません</p>
                <p className="mt-2 text-xs">
                  上部の「生成する」ボタンから生成できます
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default ThemeForm;

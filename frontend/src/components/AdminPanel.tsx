import { useEffect, useState } from "react";
import { apiClient } from "../services/api/apiClient";

function AdminPanel() {
  const [problems, setProblems] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [policyDrafts, setPolicyDrafts] = useState([]);
  const [digestDrafts, setDigestDrafts] = useState([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState(false);
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingPolicyDrafts, setIsLoadingPolicyDrafts] = useState(false);
  const [isLoadingDigestDrafts, setIsLoadingDigestDrafts] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch questions on component mount and when questions are generated
  useEffect(() => {
    fetchQuestions();
    fetchPolicyDrafts();
    fetchDigestDrafts();
  }, []);

  // Fetch problems and solutions when those tabs are selected
  useEffect(() => {
    if (activeTab === "problems" && problems.length === 0) {
      fetchProblems();
    } else if (activeTab === "solutions" && solutions.length === 0) {
      fetchSolutions();
    }
  }, [activeTab]);

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    setError(null);

    const themeId = localStorage.getItem("defaultThemeId");
    if (!themeId) {
      setError("デフォルトテーマが見つかりません。");
      setIsLoadingQuestions(false);
      return;
    }

    const result = await apiClient.getAllQuestions(themeId);

    if (result.isErr()) {
      const apiError = result.error;
      console.error("Failed to fetch questions:", apiError);
      setError("問いの読み込みに失敗しました。");
      setIsLoadingQuestions(false);
      return;
    }

    setQuestions(result.value);
    setIsLoadingQuestions(false);
  };

  const fetchProblems = async () => {
    setIsLoadingProblems(true);
    setError(null);

    const themeId = localStorage.getItem("defaultThemeId");
    if (!themeId) {
      setError("デフォルトテーマが見つかりません。");
      setIsLoadingProblems(false);
      return;
    }

    const result = await apiClient.getAllProblems(themeId);

    if (result.isErr()) {
      const apiError = result.error;
      console.error("Failed to fetch problems:", apiError);
      setError("課題の読み込みに失敗しました。");
      setIsLoadingProblems(false);
      return;
    }

    setProblems(result.value);
    setIsLoadingProblems(false);
  };

  const fetchSolutions = async () => {
    setIsLoadingSolutions(true);
    setError(null);

    const themeId = localStorage.getItem("defaultThemeId");
    if (!themeId) {
      setError("デフォルトテーマが見つかりません。");
      setIsLoadingSolutions(false);
      return;
    }

    const result = await apiClient.getAllSolutions(themeId);

    if (result.isErr()) {
      const apiError = result.error;
      console.error("Failed to fetch solutions:", apiError);
      setError("解決策の読み込みに失敗しました。");
      setIsLoadingSolutions(false);
      return;
    }

    setSolutions(result.value);
    setIsLoadingSolutions(false);
  };

  const fetchPolicyDrafts = async () => {
    setIsLoadingPolicyDrafts(true);
    setError(null);

    const themeId = localStorage.getItem("defaultThemeId");
    if (!themeId) {
      setError("デフォルトテーマが見つかりません。");
      setIsLoadingPolicyDrafts(false);
      return;
    }

    const result = await apiClient.getAllPolicyDrafts(themeId);

    if (result.isErr()) {
      const apiError = result.error;
      console.error("Failed to fetch policy drafts:", apiError);
      setError("政策ドラフトの読み込みに失敗しました。");
      setIsLoadingPolicyDrafts(false);
      return;
    }

    setPolicyDrafts(result.value);
    setIsLoadingPolicyDrafts(false);
  };

  const fetchDigestDrafts = async () => {
    setIsLoadingDigestDrafts(true);
    setError(null);

    const themeId = localStorage.getItem("defaultThemeId");
    if (!themeId) {
      setError("デフォルトテーマが見つかりません。");
      setIsLoadingDigestDrafts(false);
      return;
    }

    const result = await apiClient.getAllDigestDrafts(themeId);

    if (result.isErr()) {
      const apiError = result.error;
      console.error("Failed to fetch digest drafts:", apiError);
      setError("ダイジェストの読み込みに失敗しました。");
      setIsLoadingDigestDrafts(false);
      return;
    }

    setDigestDrafts(result.value);
    setIsLoadingDigestDrafts(false);
  };

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);
    setError(null);
    setSuccessMessage(null);

    const themeId = localStorage.getItem("defaultThemeId");
    if (!themeId) {
      setError("デフォルトテーマが見つかりません。");
      setIsGeneratingQuestions(false);
      return;
    }

    const result = await apiClient.generateQuestions(themeId);

    if (result.isErr()) {
      const apiError = result.error;
      console.error("Failed to generate questions:", apiError);
      setError("問いの生成に失敗しました。");
      setIsGeneratingQuestions(false);
      return;
    }

    setSuccessMessage(
      "シャープな問いの生成を開始しました。しばらくすると問いリストに表示されます。"
    );

    // Fetch questions after a delay to allow time for generation
    setTimeout(() => {
      fetchQuestions();
    }, 5000);

    setIsGeneratingQuestions(false);
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <div className="p-6 animate-fade-in min-h-full">
      <h2 className="text-2xl font-semibold mb-6 text-primary border-b border-neutral-200 pb-2">
        管理パネル
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <title>エラー</title>
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <title>成功</title>
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

      {/* Action Buttons */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-neutral-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-primary-dark mb-1">
              シャープな問い生成
            </h3>
            <p className="text-sm text-neutral-600">
              課題データから新しいシャープな問いを生成します
            </p>
          </div>
          <button
            onClick={handleGenerateQuestions}
            disabled={isGeneratingQuestions}
            className="btn bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm whitespace-nowrap hover:bg-primary-dark"
            type="button"
          >
            {isGeneratingQuestions ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <title>生成中</title>
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
            ) : (
              "シャープな問い生成"
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-neutral-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("questions")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "questions"
                  ? "text-primary border-b-2 border-primary"
                  : "text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }`}
              type="button"
            >
              シャープな問い
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("problems")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "problems"
                  ? "text-primary border-b-2 border-primary"
                  : "text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }`}
              type="button"
            >
              課題
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab("solutions")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "solutions"
                  ? "text-primary border-b-2 border-primary"
                  : "text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }`}
              type="button"
            >
              解決策
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("policies")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "policies"
                  ? "text-primary border-b-2 border-primary"
                  : "text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }`}
              type="button"
            >
              政策ドラフト
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("digests")}
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "digests"
                  ? "text-success border-b-2 border-success"
                  : "text-neutral-500 hover:text-neutral-700 hover:border-neutral-300"
              }`}
              type="button"
            >
              一般向けダイジェスト
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm">
        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div>
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
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                      >
                        問い
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                      >
                        作成日時
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {questions.map((question) => (
                      <tr key={question._id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-normal text-sm text-neutral-700">
                          {question.questionText}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {formatDate(question.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-500 text-sm border border-dashed border-neutral-300 rounded-lg">
                <p>まだ問いが生成されていません</p>
                <p className="mt-2 text-xs">
                  上部の「シャープな問い生成」ボタンから生成できます
                </p>
              </div>
            )}
          </div>
        )}

        {/* Problems Tab */}
        {activeTab === "problems" && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-dark">
              課題一覧 ({problems.length})
            </h3>
            {isLoadingProblems ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-pulse-slow flex space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
              </div>
            ) : problems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                      >
                        課題
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                      >
                        ソース
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                      >
                        作成日時
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {problems.map((problem) => (
                      <tr key={problem._id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-normal text-sm text-neutral-700">
                          {problem.statement}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {problem.sourceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {formatDate(problem.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-500 text-sm border border-dashed border-neutral-300 rounded-lg">
                <p>まだ課題が抽出されていません</p>
                <p className="mt-2 text-xs">
                  チャットを通じて課題を抽出するか、インポート機能を使用してください
                </p>
              </div>
            )}
          </div>
        )}

        {/* Solutions Tab */}
        {activeTab === "solutions" && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-dark">
              解決策一覧 ({solutions.length})
            </h3>
            {isLoadingSolutions ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-pulse-slow flex space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
              </div>
            ) : solutions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                      >
                        解決策
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                      >
                        ソース
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                      >
                        作成日時
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {solutions.map((solution) => (
                      <tr key={solution._id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-normal text-sm text-neutral-700">
                          {solution.statement}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {solution.sourceType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {formatDate(solution.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-500 text-sm border border-dashed border-neutral-300 rounded-lg">
                <p>まだ解決策が抽出されていません</p>
                <p className="mt-2 text-xs">
                  チャットを通じて解決策を抽出するか、インポート機能を使用してください
                </p>
              </div>
            )}
          </div>
        )}

        {/* Policy Drafts Tab */}
        {activeTab === "policies" && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-dark">
              政策ドラフト一覧 ({policyDrafts.length})
            </h3>
            {isLoadingPolicyDrafts ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-pulse-slow flex space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="w-2 h-2 bg-primary rounded-full" />
                </div>
              </div>
            ) : policyDrafts.length > 0 ? (
              <div className="space-y-4">
                {policyDrafts.map((draft) => (
                  <div
                    key={draft._id}
                    className="p-4 border border-neutral-200 rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    <h4 className="font-semibold text-primary-dark text-lg mb-2">
                      {draft.title}
                    </h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                        v{draft.version || "1"}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatDate(draft.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 mb-3">
                      {truncateText(draft.content, 200)}
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-primary hover:text-primary-dark">
                        全文を表示
                      </summary>
                      <div className="mt-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                        <p className="whitespace-pre-wrap">{draft.content}</p>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-500 text-sm border border-dashed border-neutral-300 rounded-lg">
                <p>まだ政策ドラフトが生成されていません</p>
                <p className="mt-2 text-xs">
                  可視化エリアで問いを選択し、政策ドラフト生成ボタンを使用してください
                </p>
              </div>
            )}
          </div>
        )}

        {/* Digest Drafts Tab */}
        {activeTab === "digests" && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-success">
              一般向けダイジェスト一覧 ({digestDrafts.length})
            </h3>
            {isLoadingDigestDrafts ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-pulse-slow flex space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <div className="w-2 h-2 bg-success rounded-full" />
                </div>
              </div>
            ) : digestDrafts.length > 0 ? (
              <div className="space-y-4">
                {digestDrafts.map((draft) => (
                  <div
                    key={draft._id}
                    className="p-4 border border-success/30 rounded-lg hover:shadow-md transition-all duration-200 bg-success/5"
                  >
                    <h4 className="font-semibold text-success text-lg mb-2">
                      {draft.title}
                    </h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-success text-white text-xs px-2 py-1 rounded-full">
                        v{draft.version || "1"}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatDate(draft.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 mb-3">
                      {truncateText(draft.content, 200)}
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-success hover:text-success/80">
                        全文を表示
                      </summary>
                      <div className="mt-3 p-4 bg-white rounded-lg border border-success/20">
                        <p className="whitespace-pre-wrap">{draft.content}</p>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-neutral-500 text-sm border border-dashed border-success/30 rounded-lg">
                <p>まだダイジェストが生成されていません</p>
                <p className="mt-2 text-xs">
                  可視化エリアで問いを選択し、ダイジェスト生成ボタンを使用してください
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;

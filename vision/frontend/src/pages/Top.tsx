import { useEffect, useState } from "react";
import TopPageTemplate from "../components/top/TopPageTemplate";
import { useMock } from "../contexts/MockContext";
import { apiClient } from "../services/api/apiClient";
import type { Opinion, Question, Theme } from "../types";

const Top = () => {
  const { isMockMode } = useMock();
  const [topPageData, setTopPageData] = useState<{
    latestThemes: Theme[];
    latestQuestions: Question[];
    latestOpinions: Opinion[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(!isMockMode);
  const [error, setError] = useState<string | null>(null);

  const mockDiscussionData = [
    {
      id: 1,
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      problemCount: 99,
      solutionCount: 99,
      likeCount: 99,
    },
    {
      id: 2,
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      problemCount: 99,
      solutionCount: 99,
      likeCount: 99,
    },
    {
      id: 3,
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      problemCount: 99,
      solutionCount: 99,
      likeCount: 99,
    },
  ];

  const mockThemeData = [
    {
      id: "1",
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      description:
        "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      keyQuestionCount: 99,
      commentCount: 99,
    },
    {
      id: "2",
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      description:
        "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      keyQuestionCount: 99,
      commentCount: 99,
    },
    {
      id: "3",
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      description:
        "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      keyQuestionCount: 99,
      commentCount: 99,
    },
  ];

  const mockQuestions = [
    {
      _id: "sq1",
      questionText:
        "どうすれば、健康で活発な高齢者と年金制度の現状から、議論が健康に関わらず個人の人々や社会と考えていた政府の施策と主張や解決策として改革案を議論できるのか？",
      tagLine: "年金・医療・介護",
      themeId: "1",
      issueCount: 45,
      solutionCount: 32,
      likeCount: 99,
    },
    {
      _id: "sq2",
      questionText:
        "どうすれば、環境問題への意識が高まる中で、持続可能な社会を実現するための具体的な政策や取り組みを市民レベルで推進できるのか？",
      tagLine: "環境・エネルギー",
      themeId: "2",
      issueCount: 38,
      solutionCount: 27,
      likeCount: 87,
    },
    {
      _id: "sq3",
      questionText:
        "どうすれば、地方創生と都市集中の問題を解決し、地域ごとの特色を活かした持続可能な発展を実現できるのか？",
      tagLine: "地方創生・都市計画",
      themeId: "3",
      issueCount: 52,
      solutionCount: 41,
      likeCount: 120,
    },
    {
      _id: "sq4",
      questionText:
        "どうすれば、AI技術の発展に伴う雇用の変化に対応し、全ての人が新しい時代に適応できる社会を作れるのか？",
      tagLine: "テクノロジー・雇用",
      themeId: "1",
      issueCount: 67,
      solutionCount: 55,
      likeCount: 145,
    },
    {
      _id: "sq5",
      questionText:
        "どうすれば、子育て世代が安心して働き続けられる環境を整備し、少子化問題に対処できるのか？",
      tagLine: "子育て・少子化対策",
      themeId: "2",
      issueCount: 73,
      solutionCount: 61,
      likeCount: 168,
    },
  ];

  useEffect(() => {
    if (isMockMode) return;

    const fetchTopPageData = async () => {
      setIsLoading(true);
      setError(null);

      const result = await apiClient.getTopPageData();

      if (!result.isOk()) {
        setError(`データの取得に失敗しました: ${result.error.message}`);
        console.error("Error fetching top page data:", result.error);
        setIsLoading(false);
        return;
      }

      setTopPageData(result.value);
      setIsLoading(false);
    };

    fetchTopPageData();
  }, [isMockMode]);

  if (!isMockMode && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 xl:max-w-none">
        <div className="text-center py-8">
          <p>データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isMockMode && error) {
    return (
      <div className="container mx-auto px-4 py-8 xl:max-w-none">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isMockMode || topPageData) {
    const templateProps = isMockMode
      ? {
          discussions: mockDiscussionData,
          themes: mockThemeData,
          questions: mockQuestions,
          latestOpinions: [], // Mock mode doesn't have opinions yet
        }
      : {
          latestQuestions: topPageData?.latestQuestions || [],
          latestOpinions: topPageData?.latestOpinions || [],
        };

    return <TopPageTemplate {...templateProps} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 xl:max-w-none">
      <div className="text-center py-8">
        <p>データを表示できません。</p>
      </div>
    </div>
  );
};

export default Top;

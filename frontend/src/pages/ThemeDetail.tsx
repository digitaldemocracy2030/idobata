import { useLocation, useParams } from "react-router-dom";
import ThemeDetailTemplate from "../components/theme/ThemeDetailTemplate";
import { useThemeDetail } from "../hooks/useThemeDetail";

const ThemeDetail = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const location = useLocation();
  const useMockData = location.search.includes("mock=true");

  // モックデータを使用する場合はAPIを呼び出さない
  const { themeDetail, isLoading, error } = useMockData
    ? { themeDetail: null, isLoading: false, error: null }
    : useThemeDetail(themeId || "");

  // モックデータ
  const mockThemeData = {
    _id: themeId || "",
    title: "若者の雇用とキャリア支援",
    description:
      "若者の雇用不安や将来への不安を解消し、安心してキャリアを築ける社会の実現について議論します。新卒一括採用や終身雇用の変化、フリーランスの増加など、働き方の多様化に対応した支援策を考えます。",
  };

  const mockKeyQuestions = [
    {
      id: 1,
      question:
        "どうすれば若者が安心して多様な働き方を選択できる社会になるか？",
      voteCount: 42,
      issueCount: 15,
      solutionCount: 23,
    },
    {
      id: 2,
      question: "新卒一括採用に代わる、若者の能力を活かせる採用の仕組みとは？",
      voteCount: 38,
      issueCount: 12,
      solutionCount: 18,
    },
    {
      id: 3,
      question: "若者のキャリア教育はどのように改善すべきか？",
      voteCount: 35,
      issueCount: 10,
      solutionCount: 16,
    },
  ];

  const mockIssues = [
    {
      id: 1,
      text: "新卒一括採用の仕組みが、若者のキャリア選択の幅を狭めている",
    },
    { id: 2, text: "大学教育と実社会で求められるスキルにギャップがある" },
    { id: 3, text: "若者の非正規雇用が増加し、将来設計が立てにくい" },
    {
      id: 4,
      text: "キャリア教育が不十分で、自分に合った仕事を見つけられない若者が多い",
    },
    { id: 5, text: "地方の若者は都市部に比べて就職機会が限られている" },
  ];

  const mockSolutions = [
    { id: 1, text: "インターンシップ制度の拡充と単位認定の推進" },
    { id: 2, text: "職業体験プログラムを中高生から段階的に導入する" },
    { id: 3, text: "若者向けのキャリアカウンセリングサービスの無料提供" },
    { id: 4, text: "リモートワークの推進による地方在住若者の就業機会拡大" },
    { id: 5, text: "若者の起業支援と失敗しても再チャレンジできる制度の整備" },
  ];

  // ローディング状態
  if (!useMockData && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p>テーマの詳細を読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (!useMockData && error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // モックデータまたはAPIデータが利用可能な場合、テンプレートをレンダリング
  if (useMockData || themeDetail) {
    // テンプレートのpropsにデータをマッピング
    const templateProps = useMockData
      ? {
          theme: mockThemeData,
          keyQuestions: mockKeyQuestions,
          issues: mockIssues,
          solutions: mockSolutions,
        }
      : {
          theme: {
            _id: themeDetail?.theme?._id ?? "",
            title: themeDetail?.theme?.title ?? "",
            description: themeDetail?.theme?.description ?? "",
          },
          keyQuestions:
            themeDetail?.keyQuestions?.map((q) => ({
              id: q._id ?? "",
              question: q.questionText ?? "",
              voteCount: q.voteCount ?? 0,
              issueCount: q.issueCount ?? 0,
              solutionCount: q.solutionCount ?? 0,
            })) ?? [],
          issues:
            themeDetail?.issues?.map((issue) => ({
              id: issue._id ?? "",
              text: issue.statement ?? "",
            })) ?? [],
          solutions:
            themeDetail?.solutions?.map((solution) => ({
              id: solution._id ?? "",
              text: solution.statement ?? "",
            })) ?? [],
        };

    return <ThemeDetailTemplate {...templateProps} />;
  }

  // 予期しない状態の場合のフォールバック
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-8">
        <p>テーマの詳細を表示できません。</p>
      </div>
    </div>
  );
};

export default ThemeDetail;

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { type FloatingChatRef } from "../components/chat";
import ThemeDetailTemplate from "../components/theme/ThemeDetailTemplate";
import { useAuth } from "../contexts/AuthContext";
import { useMock } from "../contexts/MockContext";
import { useThemeDetail } from "../hooks/useThemeDetail";
import { ThemeDetailChatManager } from "../services/chatManagers/ThemeDetailChatManager";
import type { NewExtractionEvent } from "../services/socket/socketClient";
import type { Message } from "../types";
import { SystemMessage, SystemNotification } from "../types";

const ThemeDetail = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const { isMockMode } = useMock();
  const { user } = useAuth();
  const floatingChatRef = useRef<FloatingChatRef>(null);
  const [chatManager, setChatManager] = useState<ThemeDetailChatManager | null>(
    null
  );

  const {
    themeDetail: apiThemeDetail,
    isLoading: apiIsLoading,
    error: apiError,
  } = useThemeDetail(themeId || "");

  const themeDetail = isMockMode ? null : apiThemeDetail;
  const isLoading = isMockMode ? false : apiIsLoading;
  const error = isMockMode ? null : apiError;

  const isCommentDisabled = isMockMode
    ? false
    : themeDetail?.theme?.disableNewComment === true;

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
      tagLine: "多様な働き方の選択肢",
      tags: ["雇用", "キャリア", "選択"],
      voteCount: 42,
      issueCount: 15,
      solutionCount: 23,
    },
    {
      id: 2,
      question: "新卒一括採用に代わる、若者の能力を活かせる採用の仕組みとは？",
      tagLine: "能力重視の採用へ",
      tags: ["採用", "新卒", "能力"],
      voteCount: 38,
      issueCount: 12,
      solutionCount: 18,
    },
    {
      id: 3,
      question: "若者のキャリア教育はどのように改善すべきか？",
      tagLine: "キャリア教育の改革",
      tags: ["教育", "キャリア"],
      voteCount: 35,
      issueCount: 10,
      solutionCount: 16,
    },
  ].sort((a, b) => b.voteCount - a.voteCount);

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

  useEffect(() => {
    if (!themeId) return;

    const themeName = isMockMode
      ? mockThemeData.title
      : (themeDetail?.theme?.title ?? "");

    if (themeName && user.id) {
      const manager = new ThemeDetailChatManager({
        themeId,
        themeName,
        userId: user.id,
        onNewMessage: handleNewMessage,
        onNewExtraction: handleNewExtraction,
      });

      setChatManager(manager);

      return () => {
        manager.cleanup();
      };
    }
  }, [themeId, isMockMode, themeDetail?.theme?.title, user?.id]);

  const handleNewMessage = (message: Message) => {
    if (floatingChatRef.current) {
      const messageType =
        message instanceof SystemNotification
          ? "system-message"
          : message instanceof SystemMessage
            ? "system"
            : "user";

      floatingChatRef.current.addMessage(message.content, messageType);
    }
  };

  const handleNewExtraction = (extraction: NewExtractionEvent) => {
    console.log("New extraction received:", extraction);
  };

  const handleSendMessage = async (message: string) => {
    if (chatManager) {
      await chatManager.addMessage(message, "user");
    }
  };

  if (!isMockMode && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 xl:max-w-none">
        <div className="text-center py-8">
          <p>テーマの詳細を読み込み中...</p>
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

  if (isMockMode || themeDetail) {
    const templateProps = isMockMode
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
              tagLine: q.tagLine ?? "",
              tags: q.tags ?? [],
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

    return (
      <>
        <div className="md:mr-[50%]">
          <ThemeDetailTemplate
            {...templateProps}
            onSendMessage={handleSendMessage}
            disabled={isCommentDisabled}
            ref={floatingChatRef}
          />
        </div>
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 xl:max-w-none">
      <div className="text-center py-8">
        <p>テーマの詳細を表示できません。</p>
      </div>
    </div>
  );
};

export default ThemeDetail;

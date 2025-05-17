import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { FloatingChat, type FloatingChatRef } from "../components/chat";
import BreadcrumbView from "../components/common/BreadcrumbView";
import SectionHeading from "../components/common/SectionHeading";
import CitizenReportExample from "../components/question/CitizenReportExample";
import DebateSummary from "../components/question/DebateSummary";
import KeyQuestionHeader from "../components/question/KeyQuestionHeader";
import OpinionCard from "../components/question/OpinionCard";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { Link, useMock } from "../contexts/MockContext";
import { useQuestionDetail } from "../hooks/useQuestionDetail";
import { QuestionChatManager } from "../services/chatManagers/QuestionChatManager";
import { MessageType } from "../types";

const QuestionDetail = () => {
  const { themeId, qId } = useParams<{ themeId: string; qId: string }>();
  const { isMockMode } = useMock();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"issues" | "solutions">("issues");
  const chatRef = useRef<FloatingChatRef>(null);
  const [chatManager, setChatManager] = useState<QuestionChatManager | null>(
    null
  );

  const { questionDetail, isLoading, error } = isMockMode
    ? { questionDetail: null, isLoading: false, error: null }
    : useQuestionDetail(themeId || "", qId || "");

  useEffect(() => {
    if (
      themeId &&
      qId &&
      user?.id &&
      (isMockMode || questionDetail?.question?.questionText)
    ) {
      const questionText = isMockMode
        ? mockQuestionData.question
        : questionDetail?.question?.questionText || "";

      const manager = new QuestionChatManager({
        themeId,
        questionId: qId,
        questionText,
        userId: user.id,
        onNewMessage: (message) => {
          let messageType: MessageType = "system";
          if (message.constructor.name === "UserMessage") {
            messageType = "user";
          } else if (message.constructor.name === "SystemNotification") {
            messageType = "system-message";
          }
          chatRef.current?.addMessage(message.content, messageType);
        },
        onNewExtraction: (extraction) => {
          console.log("New extraction:", extraction);
        },
      });

      setChatManager(manager);

      return () => {
        manager.cleanup();
      };
    }
  }, [themeId, qId, isMockMode, questionDetail, user?.id]);

  const handleSendMessage = (message: string) => {
    if (chatManager) {
      chatManager.addMessage(message, "user");
    } else if (isMockMode) {
      console.log("Message sent:", message);

      setTimeout(() => {
        chatRef.current?.addMessage("メッセージを受け取りました。", "system");
      }, 500);
    }
  };

  const handleRestart = () => {
    const newThreadId = `invalid_${uuidv4()}`;
    localStorage.setItem("currentThreadId", newThreadId);
    if (chatRef.current) {
      chatRef.current.clearMessages();
    }
  };

  const mockQuestionData = {
    id: qId,
    question: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
    tagLine: "若者のキャリア構築支援",
    tags: ["キャリア", "若者", "支援"],
    voteCount: 42,
  };

  const mockThemeData = {
    id: themeId,
    title: "若者の雇用とキャリア支援",
  };

  const mockDebateData = {
    axes: [
      {
        title: "支援の方向性",
        options: [
          {
            label: "個人の能力開発支援",
            description: "個人のスキルアップや能力開発を支援する政策を重視",
          },
          {
            label: "雇用環境の整備",
            description: "企業側の採用・雇用制度を改革する政策を重視",
          },
        ],
      },
      {
        title: "支援の対象",
        options: [
          {
            label: "新卒・若年層全般",
            description: "新卒者を含む若年層全体を対象とした支援策",
          },
          {
            label: "特定のニーズを持つ若者",
            description: "困難を抱える若者や特定のニーズを持つ若者に焦点",
          },
        ],
      },
    ],
    agreementPoints: [
      "現状の新卒一括採用に問題がある点",
      "キャリア教育の強化が必要な点",
      "若者のキャリア形成に関する不安が大きい点",
    ],
    disagreementPoints: [
      "国の介入度合い（市場主導 vs 政府主導）",
      "支援の優先順位（教育改革 vs 雇用制度改革）",
      "地方と都市部の格差への対応策",
    ],
  };

  const mockOpinions = {
    issues: [
      {
        id: 1,
        text: "新卒一括採用の仕組みが、若者のキャリア選択の幅を狭めている",
        relevance: 95,
      },
      {
        id: 2,
        text: "大学教育と実社会で求められるスキルにギャップがある",
        relevance: 87,
      },
      {
        id: 3,
        text: "若者の非正規雇用が増加し、将来設計が立てにくい",
        relevance: 82,
      },
      {
        id: 4,
        text: "キャリア教育が不十分で、自分に合った仕事を見つけられない若者が多い",
        relevance: 78,
      },
      {
        id: 5,
        text: "地方の若者は都市部に比べて就職機会が限られている",
        relevance: 75,
      },
    ],
    solutions: [
      {
        id: 1,
        text: "インターンシップ制度の拡充と単位認定の推進",
        relevance: 92,
      },
      {
        id: 2,
        text: "職業体験プログラムを中高生から段階的に導入する",
        relevance: 88,
      },
      {
        id: 3,
        text: "若者向けのキャリアカウンセリングサービスの無料提供",
        relevance: 84,
      },
      {
        id: 4,
        text: "リモートワークの推進による地方在住若者の就業機会拡大",
        relevance: 79,
      },
      {
        id: 5,
        text: "若者の起業支援と失敗しても再チャレンジできる制度の整備",
        relevance: 76,
      },
    ],
  };

  const mockReportExample = {
    introduction:
      "若者の雇用とキャリア形成に関する市民の意見を集約した結果、以下のような課題が浮かび上がりました。これらの課題に対して、政策立案者は具体的な対応を検討すべきです。",
    issues: [
      {
        title: "1. 新卒一括採用システムの見直し",
        description:
          "現行の新卒一括採用システムは若者のキャリア選択の幅を狭め、多様な才能や適性を活かしにくくしています。通年採用や複数回採用の導入、中途採用の強化などの改革が求められています。",
      },
      {
        title: "2. 実践的なキャリア教育の充実",
        description:
          "学校教育と実社会のギャップを埋めるため、早期からの職業体験やインターンシップ、社会人メンターとの交流など、実践的なキャリア教育の充実が必要です。",
      },
      {
        title: "3. 若者の非正規雇用問題への対応",
        description:
          "若者の非正規雇用の増加は将来の不安定さにつながります。正規雇用への転換支援や、非正規でも安定したキャリア形成が可能な制度設計が求められています。",
      },
    ],
  };

  if (!isMockMode && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p>質問の詳細を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isMockMode && error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isMockMode || questionDetail) {
    const questionData = isMockMode
      ? mockQuestionData
      : {
          id: questionDetail?.question?._id ?? "",
          question: questionDetail?.question?.questionText ?? "",
          tagLine: questionDetail?.question?.tagLine ?? "",
          tags: questionDetail?.question?.tags ?? [],
          voteCount: questionDetail?.question?.voteCount ?? 0,
        };

    const themeData = isMockMode
      ? mockThemeData
      : {
          id: themeId || "",
          title: "テーマ", // APIからテーマ情報を取得する必要があるかも
        };

    const debateData = isMockMode ? mockDebateData : questionDetail?.debateData;

    const opinions = isMockMode
      ? mockOpinions
      : {
          issues:
            questionDetail?.relatedProblems?.map((p) => ({
              id: p._id,
              text: p.statement,
              relevance: Math.round(p.relevanceScore * 100) || 0,
            })) ?? [],
          solutions:
            questionDetail?.relatedSolutions?.map((s) => ({
              id: s._id,
              text: s.statement,
              relevance: Math.round(s.relevanceScore * 100) || 0,
            })) ?? [],
        };

    const reportExample = isMockMode
      ? mockReportExample
      : (questionDetail?.reportExample ?? {
          introduction:
            "レポート例はまだ作成されていません。より多くの意見が集まるとレポート例が表示されるようになります。",
          issues: [],
        });

    const breadcrumbItems = [
      { label: "TOP", href: "/" },
      { label: "テーマ一覧", href: "/themes" },
      { label: themeData.title, href: `/themes/${themeId}` },
      {
        label: questionData.tagLine || questionData.question,
        href: `/themes/${themeId}/questions/${qId}`,
      },
    ];

    return (
      <>
        <div className="md:mr-[50%]">
          <div className="container mx-auto px-4 py-8">
            <BreadcrumbView items={breadcrumbItems} />
          </div>
          <KeyQuestionHeader
            question={questionData.question}
            tagLine={questionData.tagLine}
            tags={questionData.tags}
            voteCount={questionData.voteCount}
            questionId={questionData.id}
          />
          <DebateSummary
            debateData={debateData}
            visualReport={questionDetail?.visualReport}
          />
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-grow">
                <SectionHeading title="寄せられた意見" />
              </div>
              <Link
                to={`/themes/${themeId}/questions/${qId}/comments`}
                className="text-base text-primary-500 hover:underline"
              >
                すべて見る
              </Link>
            </div>

            <div className="flex border-b border-neutral-200 mb-4">
              <button
                className={`flex-1 py-2 px-4 text-base font-bold ${activeTab === "issues" ? "border-b-4 border-primary-500 text-primary-700" : "text-neutral-700"}`}
                onClick={() => setActiveTab("issues")}
                type="button"
              >
                課題点 ({opinions.issues.length})
              </button>
              <button
                className={`flex-1 py-2 px-4 text-base font-bold ${activeTab === "solutions" ? "border-b-4 border-primary-500 text-primary-700" : "text-neutral-700 "}`}
                onClick={() => setActiveTab("solutions")}
                type="button"
              >
                解決策 ({opinions.solutions.length})
              </button>
            </div>

            <div className="space-y-3">
              {activeTab === "issues"
                ? opinions.issues
                    .slice(0, 3)
                    .map((issue) => (
                      <OpinionCard
                        key={issue.id}
                        id={issue.id}
                        text={issue.text}
                        type="課題点"
                        relevance={issue.relevance || 0}
                      />
                    ))
                : opinions.solutions
                    .slice(0, 3)
                    .map((solution) => (
                      <OpinionCard
                        key={solution.id}
                        id={solution.id}
                        text={solution.text}
                        type="解決策"
                        relevance={solution.relevance || 0}
                      />
                    ))}
            </div>

            {((activeTab === "issues" && opinions.issues.length > 3) ||
              (activeTab === "solutions" && opinions.solutions.length > 3)) && (
              <div className="flex justify-start">
                <Button asChild size="lg" className="w-auto mt-4">
                  <Link to={`/themes/${themeId}/questions/${qId}/comments`}>
                    もっと見る
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
          <CitizenReportExample
            introduction={reportExample.introduction}
            issues={reportExample.issues}
          />
        </div>
        <FloatingChat
          ref={chatRef}
          onSendMessage={handleSendMessage}
          onRestart={handleRestart}
        />
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-8">
        <p>質問の詳細を表示できません。</p>
      </div>
    </div>
  );
};

export default QuestionDetail;

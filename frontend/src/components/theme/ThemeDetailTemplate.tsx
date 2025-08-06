import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { apiClient } from "../../services/api/apiClient";
import type { NewExtractionEvent } from "../../services/socket/socketClient";
import { MessageType } from "../../types";
import { FloatingChat, type FloatingChatRef } from "../chat";
import BreadcrumbView from "../common/BreadcrumbView";
import SectionHeading from "../common/SectionHeading";
import CommentCard from "./CommentCard";
import KeyQuestionCard from "./KeyQuestionCard";

interface ThemeDetailTemplateProps {
  theme: {
    _id: string;
    title: string;
    description: string;
  };
  keyQuestions: {
    id: number | string;
    question: string;
    tagLine?: string;
    tags?: string[];
    voteCount: number;
    issueCount: number;
    solutionCount: number;
  }[];
  issues: {
    id: number | string;
    text: string;
  }[];
  solutions: {
    id: number | string;
    text: string;
  }[];
  disabled?: boolean;
  onSendMessage?: (message: string) => void;
  onNewExtraction?: (handler: (extraction: NewExtractionEvent) => void) => void;
}

const ThemeDetailTemplate = forwardRef<
  FloatingChatRef,
  ThemeDetailTemplateProps
>(
  (
    {
      theme,
      keyQuestions,
      issues,
      solutions,
      disabled = false,
      onSendMessage,
      onNewExtraction,
    },
    ref
  ) => {
    const [activeTab, setActiveTab] = useState<"issues" | "solutions">(
      "issues"
    );
    const chatRef = useRef<FloatingChatRef>(null);
    const [threadId, setThreadId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>(
      localStorage.getItem("userId") || crypto.randomUUID()
    );
    const [localIssues, setLocalIssues] = useState(issues);
    const [localSolutions, setLocalSolutions] = useState(solutions);

    useImperativeHandle(ref, () => ({
      addMessage: (content: string, type: MessageType) => {
        chatRef.current?.addMessage(content, type);
      },
      startStreamingMessage: (content: string, type: MessageType) => {
        return chatRef.current?.startStreamingMessage(content, type) || "";
      },
      updateStreamingMessage: (id: string, content: string) => {
        chatRef.current?.updateStreamingMessage(id, content);
      },
      endStreamingMessage: (id: string) => {
        chatRef.current?.endStreamingMessage(id);
      },
      clearMessages: () => {
        chatRef.current?.clearMessages();
      },
    }));

    const handleSendMessageInternal = async (message: string) => {
      console.log("Message sent:", message);

      if (onSendMessage) {
        onSendMessage(message);
        return;
      }

      chatRef.current?.addMessage(message, "user");

      const result = await apiClient.sendMessage(
        userId,
        message,
        theme._id,
        threadId || undefined
      );

      if (result.isErr()) {
        console.error("Failed to send message:", result.error);
        chatRef.current?.addMessage(
          `メッセージ送信エラー: ${result.error.message}`,
          "system"
        );
        return;
      }

      const responseData = result.value;

      chatRef.current?.addMessage(responseData.response, "system");

      if (responseData.threadId) {
        setThreadId(responseData.threadId);
      }

      if (responseData.userId && responseData.userId !== userId) {
        setUserId(responseData.userId);
        localStorage.setItem("userId", responseData.userId);
      }
    };

    const breadcrumbItems = [
      { label: "TOP", href: "/" },
      { label: "テーマ一覧", href: "/themes" },
      { label: theme.title, href: `/themes/${theme._id}` },
    ];

    useEffect(() => {
      if (!localStorage.getItem("userId")) {
        localStorage.setItem("userId", userId);
      }
    }, [userId]);

    useEffect(() => {
      setLocalIssues(issues);
    }, [issues]);

    useEffect(() => {
      setLocalSolutions(solutions);
    }, [solutions]);

    const handleNewExtraction = useCallback(
      (extraction: NewExtractionEvent) => {
        const { type, data } = extraction;

        if (type === "problem") {
          setLocalIssues((prev) => [
            ...prev,
            { id: data._id, text: data.statement },
          ]);
        } else if (type === "solution") {
          setLocalSolutions((prev) => [
            ...prev,
            { id: data._id, text: data.statement },
          ]);
        }
      },
      []
    );

    useEffect(() => {
      if (onNewExtraction) {
        onNewExtraction(handleNewExtraction);
      }
    }, [onNewExtraction, handleNewExtraction]);

    return (
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbView items={breadcrumbItems} />

        <h1 className="text-2xl md:text-3xl font-bold mb-4">{theme.title}</h1>

        <p className="text-base text-muted-foreground mb-8">
          {theme.description}
        </p>

        <div className="mb-8">
          <SectionHeading title={`重要論点（${keyQuestions.length}件）`} />
          <div className="space-y-4">
            {keyQuestions.map((question) => (
              <KeyQuestionCard
                key={question.id}
                question={question.question}
                tagLine={question.tagLine}
                tags={question.tags}
                voteCount={question.voteCount}
                issueCount={question.issueCount}
                solutionCount={question.solutionCount}
                themeId={theme._id}
                qid={question.id.toString()}
              />
            ))}
          </div>
        </div>

        <div className="mb-12">
          <SectionHeading title="寄せられた意見" />

          <div className="flex border-b border-border mb-4">
            <button
              className={`flex-1 py-2 px-4 text-base font-bold ${
                activeTab === "issues"
                  ? "border-b-4 border-primary-700 text-primary"
                  : "text-neutral-700"
              }`}
              onClick={() => setActiveTab("issues")}
              type="button"
            >
              課題点 ({localIssues.length})
            </button>
            <button
              className={`flex-1 py-2 px-4 text-base font-bold ${
                activeTab === "solutions"
                  ? "border-b-4 border-primary-700 text-primary"
                  : "text-neutral-700"
              }`}
              onClick={() => setActiveTab("solutions")}
              type="button"
            >
              解決策 ({localSolutions.length})
            </button>
          </div>

          <div className="space-y-3">
            {activeTab === "issues"
              ? localIssues.map((issue) => (
                  <CommentCard key={issue.id} text={issue.text} type="issue" />
                ))
              : localSolutions.map((solution) => (
                  <CommentCard
                    key={solution.id}
                    text={solution.text}
                    type="solution"
                  />
                ))}
          </div>
        </div>

        <FloatingChat
          ref={chatRef}
          onSendMessage={handleSendMessageInternal}
          disabled={disabled}
        />
      </div>
    );
  }
);

export default ThemeDetailTemplate;

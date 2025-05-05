import { useRef } from "react";
import {
  FloatingChat,
  type FloatingChatRef,
} from "../components/chat/FloatingChat";
import BreadcrumbView from "../components/common/BreadcrumbView";
import SectionHeading from "../components/common/SectionHeading";
import ThemeCard from "../components/home/ThemeCard";
import { useThemes } from "../hooks/useThemes";

const Themes = () => {
  const breadcrumbItems = [
    { label: "TOP", href: "/" },
    { label: "テーマ一覧", href: "/themes" },
  ];

  const chatRef = useRef<FloatingChatRef>(null);
  const { themes, isLoading, error } = useThemes();

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);

    setTimeout(() => {
      chatRef.current?.addMessage("メッセージを受け取りました。", "system");
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbView items={breadcrumbItems} />

      <SectionHeading title="議論テーマ一覧" />
      <p className="text-base text-neutral-600 mb-8">
        全国から寄せられた多様な意見をもとに、重要な社会課題について議論するテーマを設定しています。
        関心のあるテーマに参加して、あなたの声を政策づくりに活かしましょう。
      </p>

      {isLoading && (
        <div className="text-center py-8">
          <p>テーマを読み込み中...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && themes.length === 0 && (
        <div className="text-center py-8">
          <p>テーマがありません。</p>
        </div>
      )}

      {!isLoading && !error && themes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-12">
          {themes.map((theme) => (
            <ThemeCard
              key={theme._id}
              id={theme._id}
              title={theme.title}
              description={theme.description || ""}
              keyQuestionCount={theme.keyQuestionCount || 0}
              commentCount={theme.commentCount || 0}
            />
          ))}
        </div>
      )}

      <FloatingChat ref={chatRef} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Themes;

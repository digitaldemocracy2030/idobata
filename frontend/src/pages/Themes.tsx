import { useEffect, useRef, useState } from "react";
import {
  FloatingChat,
  type FloatingChatRef,
} from "../components/chat/FloatingChat";
import BreadcrumbView from "../components/common/BreadcrumbView";
import ThemeCard from "../components/home/ThemeCard";
import { apiClient } from "../services/api/apiClient";
import type { Theme } from "../types";

const Themes = () => {
  const breadcrumbItems = [
    { label: "TOP", href: "/" },
    { label: "テーマ一覧", href: "/themes" },
  ];

  const chatRef = useRef<FloatingChatRef>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      setError(null);

      const result = await apiClient.getAllThemes();

      if (!result.isOk()) {
        setError(`テーマの取得に失敗しました: ${result.error.message}`);
        console.error("Error fetching themes:", result.error);
        setIsLoading(false);
        return;
      }

      setThemes(result.value);
      setIsLoading(false);
    };

    fetchThemes();
  }, []);

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);

    setTimeout(() => {
      chatRef.current?.addMessage("メッセージを受け取りました。", "system");
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbView items={breadcrumbItems} />

      <h1 className="text-2xl md:text-3xl font-bold mb-4">議論テーマ一覧</h1>

      <p className="text-sm text-neutral-600 mb-8">
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
              id={Number(theme._id)} // ThemeCardがnumber型を期待しているため変換
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

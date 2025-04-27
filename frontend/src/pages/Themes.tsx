import { useRef } from "react";
import {
  FloatingChat,
  type FloatingChatRef,
} from "../components/chat/FloatingChat";
import BreadcrumbView from "../components/common/BreadcrumbView";
import ThemeCard from "../components/home/ThemeCard";

const Themes = () => {
  const breadcrumbItems = [
    { label: "TOP", href: "/" },
    { label: "テーマ一覧", href: "/themes" },
  ];

  const chatRef = useRef<FloatingChatRef>(null);

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);

    setTimeout(() => {
      chatRef.current?.addMessage("メッセージを受け取りました。", "system");
    }, 500);
  };

  const themesData = [
    {
      id: 1,
      title: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
      description:
        "若者の雇用不安や将来への不安を解消し、安心してキャリアを築ける社会の実現について議論します。",
      keyQuestionCount: 12,
      commentCount: 45,
    },
    {
      id: 2,
      title: "子育て世代が直面する課題とその解決策",
      description:
        "子育て世代が抱える経済的・時間的負担や、保育・教育の問題について考えます。",
      keyQuestionCount: 8,
      commentCount: 32,
    },
    {
      id: 3,
      title: "高齢化社会における地域コミュニティの在り方",
      description:
        "高齢化が進む地域での支え合いや、コミュニティ再生のアイデアを集めます。",
      keyQuestionCount: 10,
      commentCount: 28,
    },
    {
      id: 4,
      title: "デジタル社会における個人情報保護と利便性のバランス",
      description:
        "デジタル化が進む中で、個人情報の保護と利便性をどうバランスさせるかを考えます。",
      keyQuestionCount: 6,
      commentCount: 19,
    },
    {
      id: 5,
      title: "持続可能なエネルギー政策の実現に向けて",
      description:
        "環境に配慮しつつ、安定したエネルギー供給を実現するための政策について議論します。",
      keyQuestionCount: 9,
      commentCount: 27,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbView items={breadcrumbItems} />

      <h1 className="text-2xl md:text-3xl font-bold mb-4">議論テーマ一覧</h1>

      <p className="text-sm text-neutral-600 mb-8">
        全国から寄せられた多様な意見をもとに、重要な社会課題について議論するテーマを設定しています。
        関心のあるテーマに参加して、あなたの声を政策づくりに活かしましょう。
      </p>

      <div className="grid grid-cols-1 gap-4 mb-12">
        {themesData.map((theme) => (
          <ThemeCard
            key={theme.id}
            title={theme.title}
            description={theme.description}
            keyQuestionCount={theme.keyQuestionCount}
            commentCount={theme.commentCount}
          />
        ))}
      </div>

      <FloatingChat ref={chatRef} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default Themes;

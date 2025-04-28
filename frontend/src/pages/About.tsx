import { useRef } from "react";
import {
  FloatingChat,
  type FloatingChatRef,
} from "../components/chat/FloatingChat";
import AboutSection from "../components/common/AboutSection";
import BreadcrumbView from "../components/common/BreadcrumbView";

const About = () => {
  const breadcrumbItems = [
    { label: "TOP", href: "/" },
    { label: "このサイトについて", href: "/about" },
  ];

  const chatRef = useRef<FloatingChatRef>(null);

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);

    setTimeout(() => {
      chatRef.current?.addMessage("メッセージを受け取りました。", "system");
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbView items={breadcrumbItems} />

      <AboutSection
        title="XX党みんなの政策フォーラムとは"
        body={
          <p>
            XX党みんなの政策フォーラムは、市民の声を政策に反映させるためのオンラインプラットフォームです。
            誰もが自由に意見を投稿し、議論に参加することができます。
            私たちは、より良い社会を実現するために、皆様の声を大切にしています。
          </p>
        }
      />

      <AboutSection
        title="話し合いの流れ"
        body={
          <>
            <h3 className="text-xl font-semibold mb-2">
              ステップ1：問題を見つける
            </h3>
            <p className="mb-4">
              日常生活で感じる課題や問題点を投稿してください。
              他の参加者の投稿を見て、共感できる問題に「いいね」をつけることもできます。
            </p>
            <h3 className="text-xl font-semibold mb-2">
              ステップ2：アイデアをつくる
            </h3>
            <p>
              問題に対する解決策やアイデアを提案してください。
              他の参加者のアイデアにコメントを付けたり、改善案を提案することもできます。
            </p>
          </>
        }
      />

      <AboutSection
        title="誰でも参加できます"
        body={
          <p>
            このフォーラムは、年齢や職業、居住地に関係なく、誰でも参加できます。
            匿名での投稿も可能で、専門知識は必要ありません。
            あなたの日常の経験や感じたことが、より良い政策づくりにつながります。
          </p>
        }
      />

      <AboutSection
        title="XX党みんなの政策フォーラムのめざすこと"
        body={
          <p>
            私たちは、市民の声を直接政策に反映させることで、より民主的で開かれた政治を実現することを目指しています。
            このフォーラムを通じて、多様な意見が交わされ、建設的な議論が生まれることを期待しています。
          </p>
        }
      />

      <AboutSection
        title="声をあげるのは、あなたの番かもしれません"
        body={
          <p>
            社会を変えるのは、一人ひとりの小さな声の積み重ねです。
            あなたの意見が、明日の政策につながるかもしれません。
            ぜひ、このフォーラムに参加して、あなたの声を聞かせてください。
          </p>
        }
      />

      <div className="text-center mt-12">
        <a
          href="https://xxparty-policy.com"
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          © xxparty-policy.com
        </a>
      </div>

      <FloatingChat ref={chatRef} onSendMessage={handleSendMessage} />
    </div>
  );
};

export default About;

import { useRef } from "react";
import {
  FloatingChat,
  type FloatingChatRef,
} from "../components/chat/FloatingChat";
import BreadcrumbView from "../components/common/BreadcrumbView";
import MarkdownRenderer from "../components/common/MarkdownRenderer";
import { useSiteConfig } from "../contexts/SiteConfigContext";

const About = () => {
  const breadcrumbItems = [
    { label: "TOP", href: "/" },
    { label: "このサイトについて", href: "/about" },
  ];

  const chatRef = useRef<FloatingChatRef>(null);
  const { siteConfig, loading } = useSiteConfig();

  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message);

    setTimeout(() => {
      chatRef.current?.addMessage("メッセージを受け取りました。", "system");
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-8 xl:max-w-none">
      <BreadcrumbView items={breadcrumbItems} />

      {loading ? (
        <div className="text-center py-4">読み込み中...</div>
      ) : (
        <MarkdownRenderer markdown={siteConfig?.aboutMessage || ""} />
      )}

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

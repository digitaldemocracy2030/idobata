import React from "react";
import { Link } from "react-router-dom";
import BreadcrumbView from "../components/common/BreadcrumbView";
import { HEADER_HEIGHT } from "../components/layout/Header";
import { Button } from "../components/ui/button";

const HowTo: React.FC = () => {
  const breadcrumbItems = [{ label: "使いかた", href: "/howto" }];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const marginTop = 16;
      const elementPosition = element.offsetTop - HEADER_HEIGHT - marginTop;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="container mx-auto px-6 py-2 max-w-4xl">
      <BreadcrumbView items={breadcrumbItems} />
      {/* ヘッダーセクション */}
      <div className="pt-4 mb-8">
        <h1 className="text-4xl font-bold mb-4">使いかた</h1>
        <p className="text-lg text-gray-700 mb-4 leading-relaxed">
          本サイトでは、ユーザーが様々なお題についてAIと対話し、その対話内容が集合知として自動でレポート生成されます。
        </p>
        <div className="flex flex-col items-start gap-4">
          <button
            type="button"
            onClick={() => scrollToSection("ai-dialogue")}
            className="text-blue-600 hover:text-blue-800 font-lg flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>右矢印</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            AIと対話する
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("view-report")}
            className="text-blue-600 hover:text-blue-800 font-lg flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>右矢印</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            レポートを見る
          </button>
        </div>
      </div>

      {/* AIと対話するセクション */}
      <section id="ai-dialogue" className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/images/howto-ai-icon.png"
            alt="AIと対話する"
            className="w-12 h-12"
          />
          <h2 className="text-2xl font-bold">AIと対話する</h2>
        </div>

        {/* ステップ1: お題を選ぶ */}
        <div className="mb-4 border border-gray-300 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            ① お題を選ぶ
          </h3>
          <img
            src="/images/howto-select-theme.png"
            alt="お題を選ぶ"
            className="w-full max-w-[360px] mb-2"
          />
          <p className="text-gray-700">
            トップページから対話したいお題を選択し、「対話をはじめる」ボタンを押してください。
          </p>
        </div>

        {/* ステップ2: AIと対話を開始する */}
        <div className="mb-4 border border-gray-300 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            ② AIと対話を開始する
          </h3>
          <img
            src="/images/howto-discussion-1.png"
            alt="AIと対話を開始する"
            className="w-full max-w-[360px] mb-2"
          />
          <p className="text-gray-700 mb-2">
            選択したお題の対話ページが表示されます。AIチャット対話欄のテキスト入力エリアからテキストを送信し、対話を開始してください。
          </p>
          <p className="text-sm text-gray-600 mb-1">
            ※スマホやタブレットでは「AIと対話を開始する」ボタンを押し、対話を開始してください。
          </p>
          <img
            src="/images/howto-discussion-2.png"
            alt="AIと対話を開始する"
            className="w-full max-w-[360px]"
          />
        </div>

        {/* ステップ3: AIと対話を深める */}
        <div className="mb-4 border border-gray-300 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            ③ AIと対話を深める
          </h3>
          <p className="text-gray-700">
            AIがチャット対話相手となり、質問したり、異なる視点を提示したりします。自由に議論し考えを深めていきましょう。チャットは何度でもやり取りできます。
          </p>
        </div>

        {/* ステップ4: 対話が完了したら */}
        <div className="mb-4 border border-gray-300 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            ④ 対話が完了したら
          </h3>
          <img
            src="/images/howto-finish-discussion.png"
            alt="対話が完了したら"
            className="w-full max-w-[360px] mb-2"
          />
          <p className="text-gray-700 mb-2">
            お題を変えたい場合は「お題を変える」ボタンを押してください。
          </p>
          <img
            src="/images/howto-finish-discussion-2.png"
            alt="対話が完了したら"
            className="w-full max-w-[360px] mb-2"
          />
          <p className="text-gray-700 mb-2">
            対話を終了したい場合は「対話を終わる」ボタンを押してください。
          </p>
        </div>
      </section>

      {/* レポートを見るセクション */}
      <section id="view-report" className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/images/howto-report-icon.png"
            alt="レポートを見る"
            className="w-12 h-12"
          />
          <h2 className="text-2xl font-bold">レポートを見る</h2>
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">
          すべての対話内容は自動で分析・要約され、お題ごとにレポートが自動生成されます。その内容をPDFや画像としてダウンロードできます。
        </p>

        {/* 論点まとめ */}
        <div className="mb-4 border border-gray-300 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            論点まとめ
          </h3>
          <img
            src="/images/howto-report-1.png"
            alt="論点まとめ"
            className="w-full max-w-[360px] mb-4"
          />
          <p className="text-gray-700">
            すべての対話内容から抽出した論点をまとめたレポートです。
          </p>
        </div>

        {/* 意見まとめ */}
        <div className="mb-4 border border-gray-300 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            意見まとめ
          </h3>
          <img
            src="/images/howto-report-2.png"
            alt="意見まとめ"
            className="w-full max-w-[360px] mb-4"
          />
          <p className="text-gray-700">
            すべての対話内容から抽出した意見をまとめたレポートです。
          </p>
        </div>

        {/* イラストまとめ */}
        <div className="mb-4 border border-gray-300 rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-3">
            イラストまとめ
          </h3>
          <img
            src="/images/howto-report-3.png"
            alt="イラストまとめ"
            className="w-full max-w-[360px] mb-4"
          />
          <p className="text-gray-700">
            すべての対話内容を分析・要約し、イラスト化したレポートです。
          </p>
        </div>
      </section>

      {/* はじめましょうセクション */}
      <section className="text-left bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/images/howto-discussion-icon.png"
            alt="はじめましょう"
            className="w-12 h-12"
          />
          <h2 className="text-2xl font-bold">はじめましょう</h2>
        </div>
        <p className="text-gray-700 mb-4">
          トップページから気になるお題を選んで、AIとの対話を始めてみてください。
        </p>
        <Button asChild>
          <Link to="/top">トップページへ</Link>
        </Button>
      </section>
    </div>
  );
};

export default HowTo;

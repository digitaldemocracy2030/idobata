import { ArrowUpRight } from "lucide-react";
import { FooterButton } from "../../ui/footer-button";
import { ProjectDescriptionText } from "../../ui/project-description-text";

const FooterIdobata = () => {
  return (
    <div className="w-full relative rounded-t-3xl overflow-hidden">
      {/* グラデーション背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#94B9F9] to-[#9CE0E5]" />
      {/* 白い半透明オーバーレイ */}
      <div className="absolute inset-0 bg-white/50" />

      {/* コンテンツ */}
      <div className="relative px-6 py-6 md:py-10">
        <div className="w-full max-w-[1024px] mx-auto bg-white rounded-3xl md:rounded-[32px] p-8">
          <div className="flex flex-col md:flex-row md:items-center md:gap-8">
            {/* ロゴとタイトルエリア */}
            <div className="flex justify-center md:justify-start mb-8 md:mb-0 md:flex-shrink-0">
              <div className="w-64 h-[68px] flex items-center justify-center">
                <div className="flex items-center gap-3">
                  {/* ロゴエリア */}
                  <img
                    src="/images/idobata-logo.svg"
                    alt="いどばたビジョン"
                    className="w-[68px] h-[68px] object-contain"
                  />
                  {/* タイトル */}
                  <h2 className="text-[32px] font-bold leading-[1.28] tracking-[0.03281em] text-[#94B9F9] whitespace-pre-line">
                    {"いどばた\nビジョン"}
                  </h2>
                </div>
              </div>
            </div>

            {/* 情報エリア */}
            <div className="flex-1 space-y-4">
              {/* テキスト */}
              <ProjectDescriptionText className="text-zinc-800">
                いどばたビジョンは、デジタル民主主義2030プロジェクトから生まれたオープンソース（OSS）アプリケーションです。
                <span className="hidden md:inline">
                  <br />
                </span>
                <span className="md:hidden"> </span>
                本ページは、そのOSS成果物を活用して構築されています。
              </ProjectDescriptionText>

              {/* ボタンエリア */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <FooterButton asChild>
                  <a
                    href="https://dd2030.org/idobata"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    いどばたについて
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </FooterButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterIdobata;

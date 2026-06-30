import { ReactNode } from "react";

interface IllustrationSummaryContentProps {
  visualReport?: string | null;
  questionDetail?: {
    visualReport?: string | null;
  } | null;
}

const IllustrationSummaryContent = ({
  visualReport,
  questionDetail,
}: IllustrationSummaryContentProps): ReactNode => {
  // HTMLコンテンツかどうかをチェック
  if (visualReport && typeof visualReport === "string") {
    // HTMLコンテンツの場合
    if (
      visualReport.includes("<!DOCTYPE html>") ||
      visualReport.includes("<html")
    ) {
      return (
        <div className="w-full h-[600px] md:h-[800px]">
          <iframe
            srcDoc={visualReport}
            className="w-full h-full border-0 rounded-2xl"
            title="イラスト要約"
            sandbox="allow-same-origin"
          />
        </div>
      );
    }
    // 画像URLの場合
    return (
      <img
        src={visualReport}
        alt="イラスト要約"
        className="max-w-full max-h-full object-contain rounded-2xl"
      />
    );
  }

  // 画像がない場合のプレースホルダー
  return (
    <div className="w-full max-w-md md:max-w-2xl h-[300px] md:h-[500px] bg-gray-300 rounded-2xl flex items-center justify-center mx-auto">
      <div className="text-center p-4">
        <span className="text-gray-600 text-sm md:text-lg block mb-2">
          {questionDetail === null
            ? "イラスト画像を読み込み中..."
            : visualReport === null
              ? "イラスト画像はまだ生成されていません"
              : "イラスト画像はまだ生成されていません"}
        </span>
        {questionDetail && visualReport === null && (
          <span className="text-gray-500 text-xs block mt-1">
            より多くの意見が集まるとイラスト要約が生成されます
          </span>
        )}
      </div>
    </div>
  );
};

export default IllustrationSummaryContent;

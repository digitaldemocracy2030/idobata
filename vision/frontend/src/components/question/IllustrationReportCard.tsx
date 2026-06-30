import { Minus, Plus } from "lucide-react";
import { ReactNode, useState } from "react";
import { DownloadButton } from "../ui";

interface IllustrationReportCardProps {
  title: string;
  downloadButtonText: string;
  children: ReactNode;
  className?: string;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

const IllustrationReportCard = ({
  title,
  downloadButtonText,
  children,
  className = "",
  isEmpty = false,
  emptyTitle = "まだ生成されていません",
  emptyDescription = "多くの対話が集まると、意見をまとめたイラストが表示されるようになります。",
}: IllustrationReportCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-gray-100 rounded-xl p-4 md:p-6 mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h3>
        <DownloadButton>{downloadButtonText}</DownloadButton>
      </div>

      <div className="bg-blue-50 border-4 border-white rounded-2xl py-4 md:py-8 relative">
        {isEmpty ? (
          // Empty state
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex flex-col gap-2 text-center">
              <h4 className="text-xl font-bold text-zinc-500 leading-10 tracking-wide">
                {emptyTitle}
              </h4>
              <p className="text-base text-zinc-500 leading-8 tracking-wide">
                {emptyDescription}
              </p>
            </div>
          </div>
        ) : (
          // Normal content
          <>
            <div
              className={`${isExpanded ? "h-auto" : "h-[200px] md:h-[280px]"} overflow-hidden flex justify-center items-center`}
            >
              {children}
            </div>

            {/* グラデーションオーバーレイ（展開時は非表示） */}
            {!isExpanded && (
              <div className="absolute bottom-12 left-0 w-full h-[100px] bg-gradient-to-t from-blue-50 to-transparent pointer-events-none" />
            )}

            {/* すべて読む/閉じるボタン */}
            <div className="flex justify-center w-full mt-4">
              <button
                type="button"
                className="flex justify-center items-center gap-1 cursor-pointer bg-transparent border-none p-0 relative z-10 group"
                onClick={toggleExpanded}
                aria-label={isExpanded ? "閉じる" : "すべて読む"}
              >
                {isExpanded ? (
                  <>
                    <Minus className="w-6 h-6 text-blue-500" />
                    <span className="text-blue-500 font-bold relative">
                      閉じる
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-200 group-hover:w-full" />
                    </span>
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-blue-500" />
                    <span className="text-blue-500 font-bold relative">
                      すべて読む
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-200 group-hover:w-full" />
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IllustrationReportCard;

import { Info } from "lucide-react";
import ThemeCard from "../theme/ThemeCard";
import { Tooltip } from "../ui";

interface ThemePromptSectionProps {
  themeTitle: string;
  themeDescription: string;
  themeTags?: string[];
  participantCount?: number;
  dialogueCount?: number;
}

const ThemePromptSection = ({
  themeTitle,
  themeDescription,
  themeTags,
  participantCount = 0,
  dialogueCount = 0,
}: ThemePromptSectionProps) => {
  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div className="space-y-2">
        <h2 className="text-[30px] font-bold leading-[1.62] tracking-[0.025em] text-zinc-800">
          次のお題についてAIと対話しましょう
        </h2>
        <p className="text-base font-normal leading-8 tracking-[0.025em] text-zinc-800">
          対話内容はAIによって自動要約されお題ごとのレポートにまとめられます。
        </p>
      </div>

      {/* お題カード */}
      <ThemeCard
        title={themeTitle}
        description={themeDescription}
        tags={themeTags}
      />

      {/* 統計情報 */}
      <div className="flex flex-col items-end space-y-1 md:flex-row md:justify-start md:items-center md:space-y-0 md:gap-4">
        <div className="flex flex-wrap justify-end items-center gap-4 md:justify-start">
          <div className="flex justify-center items-center gap-1">
            <span className="text-xs font-normal leading-6 tracking-[0.025em] text-zinc-500">
              対話参加人数
            </span>
            <span className="text-xl font-bold leading-8 tracking-[0.025em] text-zinc-800">
              {participantCount}
            </span>
          </div>
          <div className="flex justify-center items-center gap-1">
            <span className="text-xs font-normal leading-6 tracking-[0.025em] text-zinc-500">
              対話数
            </span>
            <span className="text-xl font-bold leading-8 tracking-[0.025em] text-zinc-800">
              {dialogueCount}
            </span>
          </div>
        </div>
        <Tooltip
          content="「対話参加人数」は、対話をしたアカウントの数です。アカウントはお使いの端末ごとに自動生成されます。"
          placement="top"
        >
          <div className="flex items-center gap-1 px-2 py-1">
            <Info className="h-4 w-4 text-zinc-500" strokeWidth={1.33} />
            <span className="text-xs font-normal leading-6 tracking-[0.025em] text-zinc-500">
              対話参加人数について
            </span>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default ThemePromptSection;

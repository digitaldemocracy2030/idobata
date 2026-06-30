import { cn } from "../../lib/utils";

interface ProjectDescriptionTextProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * プロジェクト説明文用のテキストコンポーネント
 * Figmaの「dd2030 area > text」スタイルに基づく
 * - フォント: BIZ UDPGothic
 * - サイズ: 12px (text-xs)
 * - 行間: 2em
 * - 文字間隔: 2.5% (0.025em)
 * - 配置: 両端揃え（モバイル）/ 左揃え（デスクトップ）
 */
export const ProjectDescriptionText = ({
  children,
  className,
}: ProjectDescriptionTextProps) => {
  return (
    <p
      className={cn(
        "text-xs leading-[2em] tracking-[0.025em] text-justify md:text-left",
        className
      )}
      style={{ fontFamily: "BIZ UDPGothic" }}
    >
      {children}
    </p>
  );
};

import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { Button } from "../../ui/button";

const FooterGeneral = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="w-full bg-white">
      {isDesktop ? (
        // PC版: 横並びレイアウト
        <div className="flex justify-between items-center px-6 py-4">
          {/* 左側: 著作権テキスト（1行） */}
          <div
            className="text-zinc-500 text-xs leading-6 tracking-[0.025em]"
            style={{ fontFamily: "BIZ UDPGothic" }}
          >
            © 2025 デジタル民主主義2030 | コンテンツ内容は作成者に帰属します
          </div>

          {/* 右側: リンクエリア */}
          <div className="flex">
            <Button
              variant="ghost"
              className="h-8 px-5 rounded-full text-xs font-bold leading-6 tracking-[0.025em] text-zinc-800 hover:bg-accent hover:text-accent-foreground"
              style={{ fontFamily: "BIZ UDPGothic" }}
            >
              利用規約
            </Button>
            <Button
              variant="ghost"
              className="h-8 px-5 rounded-full text-xs font-bold leading-6 tracking-[0.025em] text-zinc-800 hover:bg-accent hover:text-accent-foreground"
              style={{ fontFamily: "BIZ UDPGothic" }}
            >
              免責
            </Button>
          </div>
        </div>
      ) : (
        // SP版: 縦並びレイアウト
        <div className="flex flex-col items-center gap-4 px-6 py-6">
          {/* 上側: リンクエリア */}
          <div className="flex">
            <Button
              variant="ghost"
              className="h-8 px-5 rounded-full text-xs font-bold leading-6 tracking-[0.025em] text-zinc-800 hover:bg-accent hover:text-accent-foreground"
              style={{ fontFamily: "BIZ UDPGothic" }}
            >
              利用規約（未！）
            </Button>
            <Button
              variant="ghost"
              className="h-8 px-5 rounded-full text-xs font-bold leading-6 tracking-[0.025em] text-zinc-800 hover:bg-accent hover:text-accent-foreground"
              style={{ fontFamily: "BIZ UDPGothic" }}
            >
              免責（未！）
            </Button>
          </div>

          {/* 下側: 著作権テキスト（2行） */}
          <div
            className="text-center text-zinc-500 text-xs leading-6 tracking-[0.025em]"
            style={{ fontFamily: "BIZ UDPGothic" }}
          >
            © 2025 デジタル民主主義2030
            <br />
            コンテンツ内容は作成者に帰属します
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterGeneral;

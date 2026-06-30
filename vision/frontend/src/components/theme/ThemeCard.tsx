interface ThemeCardProps {
  title: string;
  description: string;
  tags?: string[];
}

const ThemeCard = ({
  title,
  description,
  tags = ["政策", "社会保障"],
}: ThemeCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#94B9F9] to-[#9CE0E5] p-6">
      {/* 白色半透明オーバーレイ */}
      <div className="absolute inset-0 bg-white/70" />

      {/* 装飾的な円 */}
      <div className="absolute -top-[310px] -right-[250px] h-[550px] w-[550px] rounded-full border-[100px] border-white/40" />

      <div className="relative z-10 space-y-3">
        {/* お題ラベル */}
        <div className="inline-flex items-center justify-center rounded px-4 py-0 bg-white">
          <span className="text-base font-normal text-zinc-800 tracking-[0.025em] leading-8">
            お題
          </span>
        </div>

        {/* タイトル */}
        <h1 className="text-[30px] font-bold leading-[1.62] tracking-[0.025em] text-zinc-800">
          {title}
        </h1>

        {/* 説明文 */}
        <p className="text-base font-normal leading-8 tracking-[0.025em] text-zinc-800">
          {description}
        </p>

        {/* タグ */}
        <div className="flex items-center gap-1">
          {tags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-3 py-0"
            >
              <span className="text-xs font-normal leading-6 tracking-[0.025em] text-zinc-500">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeCard;

export interface OpinionCardProps {
  type: "課題点" | "解決策";
  text: string;
  relevance: number;
}

const OpinionCard = ({ type, text, relevance }: OpinionCardProps) => {
  return (
    <div className="border border-neutral-200 rounded-lg p-3 bg-white hover:shadow-sm transition-all duration-200">
      <div className="flex items-start gap-2">
        <div
          className={`px-2 py-1 text-xs rounded-md ${type === "課題点" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}
        >
          {type}
        </div>
        <div className="text-xs text-neutral-500">関連度: {relevance}%</div>
      </div>
      <p className="text-sm text-neutral-700 mt-2">{text}</p>
    </div>
  );
};

export default OpinionCard;

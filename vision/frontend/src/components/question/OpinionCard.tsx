import { ThumbsUp } from "lucide-react";
import { useLike } from "../../hooks/useLike";
import { Button } from "../ui/button";

export interface OpinionCardProps {
  type: "課題点" | "解決策";
  text: string;
  relevance: number;
  id: string; // Add id for the like functionality
}

const OpinionCard = ({ type, text, relevance, id }: OpinionCardProps) => {
  const targetType = type === "課題点" ? "problem" : "solution";
  const { isLiked, likeCount, toggleLike } = useLike(targetType, id);

  return (
    <div className="border border-neutral-200 rounded-lg p-3 bg-white hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`px-2 py-1 text-sm rounded-md ${type === "課題点" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}
          >
            {type}
          </div>
          <div className="text-base text-neutral-500">関連度: {relevance}%</div>
        </div>
        <Button
          className={`${isLiked ? "text-primary hover:text-primary-400" : "text-neutral-400 hover:text-primary-400"} flex items-center gap-1 h-7 px-1`}
          size="sm"
          variant="outline"
          onClick={toggleLike}
        >
          {isLiked ? (
            <ThumbsUp className="h-4 w-4" fill="currentColor" />
          ) : (
            <ThumbsUp className="h-4 w-4" fill="none" />
          )}
          気になる
          <span className="text-xs min-w-2">{likeCount}</span>
        </Button>
      </div>
      <p className="text-base text-neutral-700 mt-2">{text}</p>
    </div>
  );
};

export default OpinionCard;

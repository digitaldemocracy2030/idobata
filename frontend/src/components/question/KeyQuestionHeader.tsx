import { ThumbsUp } from "lucide-react";
import { useLike } from "../../hooks/useLike";
import { Button } from "../ui/button";

export interface KeyQuestionHeaderProps {
  question: string;
  tagLine?: string;
  tags?: string[];
  voteCount: number;
  questionId: string;
}

const KeyQuestionHeader = ({
  question,
  tagLine,
  tags,
  voteCount,
  questionId,
}: KeyQuestionHeaderProps) => {
  const { isLiked, likeCount, toggleLike } = useLike("question", questionId);

  const displayCount = likeCount ?? voteCount;

  return (
    <div className="mb-6">
      <div className="flex justify-start gap-4 mb-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">{tagLine}</h1>
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
          <span className="text-xs min-w-2">{displayCount}</span>
        </Button>
      </div>
      <p className="text-neutral-500 mb-3">{question}</p>

      <div className="flex flex-wrap gap-3 text-sm text-neutral-500 mb-4">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="border border-gray-300 rounded-full px-2 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyQuestionHeader;

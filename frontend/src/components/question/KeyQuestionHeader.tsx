import { ThumbsUp } from "lucide-react";
import { useLike } from "../../hooks/useLike";

export interface KeyQuestionHeaderProps {
  question: string;
  voteCount: number;
  questionId: string;
}

const KeyQuestionHeader = ({
  question,
  voteCount,
  questionId,
}: KeyQuestionHeaderProps) => {
  const { isLiked, likeCount, toggleLike } = useLike("question", questionId);

  const displayCount = likeCount ?? voteCount;

  return (
    <div className="mb-6">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
        {question}
      </h1>
      <div className="flex items-center">
        <button
          className={`${isLiked ? "bg-accent hover:bg-accent-400" : "bg-primary hover:bg-primary-400"} text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200`}
          type="button"
          onClick={toggleLike}
        >
          {isLiked ? (
            <ThumbsUp className="h-5 w-5 mr-2" fill="currentColor" />
          ) : (
            <ThumbsUp className="h-5 w-5 mr-2" />
          )}
          <span>{isLiked ? "興味を持っています" : "気になる"}</span>
        </button>
        <span className="ml-3 text-sm text-neutral-600">
          {displayCount}人がこの話題に興味を持っています
        </span>
      </div>
    </div>
  );
};

export default KeyQuestionHeader;

import { Star } from "lucide-react";
import { useLike } from "../../hooks/useLike";

export interface KeyQuestionHeaderProps {
  question: string;
  voteCount: number;
  questionId: string; // Add questionId prop
}

const KeyQuestionHeader = ({ question, voteCount, questionId }: KeyQuestionHeaderProps) => {
  const { isLiked, likeCount, toggleLike } = useLike("question", questionId);
  
  const displayCount = likeCount ?? voteCount;
  
  return (
    <div className="mb-6">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
        {question}
      </h1>
      <div className="flex items-center">
        <button
          className={`${isLiked ? 'bg-amber-500' : 'bg-primary-500 hover:bg-primary-600'} text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200`}
          type="button"
          onClick={toggleLike}
        >
          <Star className="h-5 w-5 mr-2" />
          <span>{isLiked ? '興味マーク済み' : '興味マークする'}</span>
        </button>
        <span className="ml-3 text-sm text-neutral-600">
          {displayCount}人が興味マークしています
        </span>
      </div>
    </div>
  );
};

export default KeyQuestionHeader;

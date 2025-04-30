import { AlertTriangle, CheckCircle, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

interface KeyQuestionCardProps {
  question: string;
  voteCount: number;
  issueCount: number;
  solutionCount: number;
  themeId: string;
  qid: string;
}

const KeyQuestionCard = ({
  question,
  voteCount,
  issueCount,
  solutionCount,
  themeId,
  qid,
}: KeyQuestionCardProps) => {
  return (
    <Link to={`/themes/${themeId}/questions/${qid}`} className="block">
      <div className="border border-neutral-200 rounded-lg p-4 bg-white hover:shadow-md transition-all duration-200 hover:border-purple-300">
        <h3 className="font-semibold text-lg mb-3">{question}</h3>
        <div className="flex flex-wrap gap-3 text-xs text-neutral-600">
          <span className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-1 text-purple-500" />
            賛同: {voteCount}
          </span>
          <span className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-purple-500" />
            課題点: {issueCount}
          </span>
          <span className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-purple-500" />
            解決策: {solutionCount}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default KeyQuestionCard;

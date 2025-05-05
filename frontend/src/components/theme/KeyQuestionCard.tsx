import { CheckCircle, MessageSquareWarning, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardTitle } from "../../components/ui/card";
import { Link } from "../../contexts/MockContext";

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
      <Card className="hover:shadow-md transition-all duration-200 hover:border-primary-700">
        <CardContent className="p-4">
          <CardTitle className="font-semibold text-lg mb-3">
            {question}
          </CardTitle>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1 text-primary" />
              気になる: {voteCount}
            </span>
            <span className="flex items-center">
              <MessageSquareWarning className="h-4 w-4 mr-1 text-primary" />
              課題点: {issueCount}
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-primary" />
              解決策: {solutionCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default KeyQuestionCard;

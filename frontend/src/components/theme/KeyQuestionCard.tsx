import { CheckCircle, MessageSquareWarning, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardTitle } from "../../components/ui/card";
import { Link } from "../../contexts/MockContext";

interface KeyQuestionCardProps {
  question: string;
  tagLine?: string;
  tags?: string[];
  voteCount: number;
  issueCount: number;
  solutionCount: number;
  themeId: string;
  qid: string;
}

const KeyQuestionCard = ({
  question,
  tagLine,
  tags,
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
          {tagLine ? (
            <>
              <CardTitle className="font-semibold text-lg mb-2">
                {tagLine}
              </CardTitle>
              <p className="text-sm text-muted-foreground mb-3">{question}</p>
            </>
          ) : (
            <CardTitle className="font-semibold text-lg mb-3">
              {question}
            </CardTitle>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2 w-full">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary-100 text-primary-800 rounded-full px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <span className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1 text-primary" />
              賛同: {voteCount}
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

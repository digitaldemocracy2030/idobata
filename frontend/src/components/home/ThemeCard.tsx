import { ArrowRight, HelpCircle, MessageSquare } from "lucide-react";
import { Link } from "../../contexts/MockContext";
import { Card, CardContent, CardFooter, CardTitle } from "../ui/card";

interface ThemeCardProps {
  id?: string;
  title: string;
  description?: string;
  keyQuestionCount?: number;
  commentCount?: number;
  problemCount?: number;
  solutionCount?: number;
}

const ThemeCard = ({
  id,
  title,
  description,
  keyQuestionCount,
  commentCount,
}: ThemeCardProps) => {
  return (
    <Link to={`/themes/${id}`} className="block">
      <Card className="hover:shadow-md transition-all duration-200 hover:border-primary-700/50">
        <CardContent className="pt-4">
          <CardTitle className="text-lg mb-2">{title}</CardTitle>
          <div className="h-[2px] bg-gray-300 w-full my-2" />
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-0">
          <div className="flex text-xs text-muted-foreground">
            {keyQuestionCount !== undefined && keyQuestionCount > 0 && (
              <span className="flex items-center mr-4">
                <HelpCircle className="h-4 w-4 mr-1 text-primary" />
                重要論点：{keyQuestionCount}件
              </span>
            )}
            {commentCount !== undefined && commentCount > 0 && (
              <span className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1 text-primary" />
                寄せられた意見: {commentCount}件
              </span>
            )}
          </div>
          <div className="bg-primary text-primary-foreground p-1 rounded-md inline-block">
            <ArrowRight className="h-5 w-5" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ThemeCard;

import { ArrowRight, CheckCircle, ListFilter } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardTitle } from "../ui/card";

interface DiscussionCardProps {
  title: string;
  problemCount: number;
  solutionCount: number;
  id?: number | string;
}

const DiscussionCard = ({
  title,
  problemCount,
  solutionCount,
  id,
}: DiscussionCardProps) => {
  // If no id is provided, render a non-clickable card
  if (!id) {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="pt-4">
          <CardTitle className="text-base mb-2">{title}</CardTitle>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-0">
          <div className="flex text-xs text-muted-foreground">
            <span className="flex items-center mr-4">
              <ListFilter className="h-4 w-4 mr-1 text-primary" />
              課題点: {problemCount}
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-primary" />
              解決策: {solutionCount}
            </span>
          </div>
          <div className="bg-primary text-primary-foreground p-1 rounded-md">
            <ArrowRight className="h-5 w-5" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  // If id is provided, render a clickable card
  return (
    <Link to={`/discussions/${id}`} className="block">
      <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/50">
        <CardContent className="pt-4">
          <CardTitle className="text-base mb-2">{title}</CardTitle>
        </CardContent>
        <CardFooter className="flex justify-between items-center pt-0">
          <div className="flex text-xs text-muted-foreground">
            <span className="flex items-center mr-4">
              <ListFilter className="h-4 w-4 mr-1 text-primary" />
              課題点: {problemCount}
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-primary" />
              解決策: {solutionCount}
            </span>
          </div>
          <div className="bg-primary text-primary-foreground p-1 rounded-md">
            <ArrowRight className="h-5 w-5" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default DiscussionCard;

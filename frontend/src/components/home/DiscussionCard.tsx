import { ArrowRight, CheckCircle, ListFilter } from "lucide-react";
import { Link } from "react-router-dom";

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
      <div className="border border-neutral-200 rounded-lg p-4 bg-white hover:shadow-md transition-all duration-200">
        <div className="mb-2">
          <h3 className="font-semibold text-base">{title}</h3>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex text-xs text-neutral-600">
            <span className="flex items-center mr-4">
              <ListFilter className="h-4 w-4 mr-1 text-purple-500" />
              課題点: {problemCount}
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-purple-500" />
              解決策: {solutionCount}
            </span>
          </div>
          <div className="bg-purple-500 text-white p-1 rounded-md">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    );
  }

  // If id is provided, render a clickable card
  return (
    <Link to={`/discussions/${id}`} className="block">
      <div className="border border-neutral-200 rounded-xl p-4 bg-white hover:shadow-md transition-all duration-200 hover:border-purple-300">
        <div className="mb-3">
          <h3 className="font-semibold text-base">{title}</h3>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex text-xs text-neutral-600">
            <span className="flex items-center mr-4">
              <ListFilter className="h-4 w-4 mr-1 text-purple-500" />
              課題点: {problemCount}
            </span>
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-purple-500" />
              解決策: {solutionCount}
            </span>
          </div>
          <div className="bg-purple-500 text-white p-1 rounded-lg">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DiscussionCard;

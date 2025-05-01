import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";

interface SeeMoreButtonProps {
  to: string;
}

const SeeMoreButton = ({ to }: SeeMoreButtonProps) => {
  return (
    <div className="text-center mt-5">
      <Link to={to}>
        <Button
          variant="outline"
          size="sm"
          className="text-sm text-purple-500 border-purple-300 hover:bg-purple-50 rounded-full px-5 py-1.5 flex items-center mx-auto"
        >
          もっと見る
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
};

export default SeeMoreButton;

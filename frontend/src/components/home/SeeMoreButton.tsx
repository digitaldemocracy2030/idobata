import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface SeeMoreButtonProps {
  to: string;
}

const SeeMoreButton = ({ to }: SeeMoreButtonProps) => {
  return (
    <div className="text-center mt-4">
      <Link to={to}>
        <div className="inline-flex items-center text-purple-500 text-sm">
          もっと見る
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </Link>
    </div>
  );
};

export default SeeMoreButton;

import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

interface SeeMoreButtonProps {
  to: string;
  className?: string;
}

const SeeMoreButton = ({ to, className }: SeeMoreButtonProps) => {
  return (
    <div className={cn("text-center mt-4", className)}>
      <Link to={to}>
        <button
          type="button"
          className="inline-flex items-center justify-center h-[44px] py-2 px-4 text-white rounded-md hover:bg-opacity-90 transition-colors"
          style={{ backgroundColor: "#8E51FF", borderRadius: "6px" }}
        >
          もっと見る
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
      </Link>
    </div>
  );
};

export default SeeMoreButton;

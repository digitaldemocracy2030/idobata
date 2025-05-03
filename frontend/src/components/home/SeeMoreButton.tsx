import { ArrowRight } from "lucide-react";
import { Link } from "../../contexts/MockContext";
import { cn } from "../../lib/utils";

interface SeeMoreButtonProps {
  to: string;
  className?: string;
}

const SeeMoreButton = ({ to, className }: SeeMoreButtonProps) => {
  return (
    <div className={cn("mt-4", className)}>
      <Link to={to}>
        <button
          type="button"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg flex items-center transition-colors duration-200"
        >
          もっと見る
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
      </Link>
    </div>
  );
};

export default SeeMoreButton;

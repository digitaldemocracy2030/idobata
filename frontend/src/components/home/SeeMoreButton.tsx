import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

interface SeeMoreButtonProps {
  to: string;
  className?: string;
}

const SeeMoreButton = ({ to, className }: SeeMoreButtonProps) => {
  return (
    <div className={cn("text-center mt-4", className)}>
      <Link to={to}>
        <Button
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          もっと見る
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </Link>
    </div>
  );
};

export default SeeMoreButton;

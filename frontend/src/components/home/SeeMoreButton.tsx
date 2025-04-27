import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SeeMoreButtonProps {
  to: string;
}

const SeeMoreButton = ({ to }: SeeMoreButtonProps) => {
  return (
    <div className="text-center mt-4">
      <Link to={to}>
        <Button
          variant="outline"
          size="sm"
          className="text-sm text-purple-500 border-purple-300 hover:bg-purple-50 rounded-full px-4 py-1 flex items-center mx-auto"
        >
          もっと見る
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
};

export default SeeMoreButton;

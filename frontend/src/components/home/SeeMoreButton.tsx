import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

const SeeMoreButton = () => {
  return (
    <div className="text-center mt-4">
      <Button variant="outline" size="sm" className="text-sm text-purple-500 border-purple-300 hover:bg-purple-50 rounded-full px-4 py-1 flex items-center mx-auto">
        もっと見る
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default SeeMoreButton;

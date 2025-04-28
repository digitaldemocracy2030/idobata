import { MessageSquare } from "lucide-react";

interface CommentCardProps {
  text: string;
  type?: "issue" | "solution";
}

const CommentCard = ({ text, type = "issue" }: CommentCardProps) => {
  return (
    <div className="border border-neutral-200 rounded-lg p-3 bg-white hover:shadow-sm transition-all duration-200">
      <div className="flex items-start gap-2">
        <div className="mt-1">
          <MessageSquare
            className={`h-4 w-4 ${type === "issue" ? "text-orange-500" : "text-green-500"}`}
          />
        </div>
        <p className="text-sm text-neutral-700">{text}</p>
      </div>
    </div>
  );
};

export default CommentCard;

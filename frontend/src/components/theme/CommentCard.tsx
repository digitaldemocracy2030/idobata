import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";

interface CommentCardProps {
  text: string;
  type?: "issue" | "solution";
}

const CommentCard = ({ text, type = "issue" }: CommentCardProps) => {
  return (
    <Card className="hover:shadow-sm transition-all duration-200">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="mt-1">
            <MessageSquare
              className={`h-4 w-4 ${type === "issue" ? "text-destructive" : "text-accent"}`}
            />
          </div>
          <p className="text-sm text-foreground">{text}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentCard;

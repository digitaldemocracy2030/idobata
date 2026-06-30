import { UserIcon } from "lucide-react";
import { Card } from "../ui/card";

interface OpinionCardProps {
  id: string | number;
  type: "problem" | "solution";
  text: string;
  authorName: string;
  authorAvatar?: string;
  questionTagline: string;
  createdAt: string | Date;
}

const OpinionCard = ({
  text,
  authorName,
  authorAvatar,
  questionTagline,
  createdAt,
}: OpinionCardProps) => {
  // Format timestamp
  const formatTimestamp = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - d.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes}分前`;
    }
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}時間前`;
    }
    return d.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <Card className="h-full pt-4 px-4 pb-0 border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col">
        <p className="text-sm text-gray-700 leading-relaxed flex-1">{text}</p>

        <div className="flex items-center gap-3 text-gray-600 mt-2">
          <div className="flex items-center gap-2 py-2">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-4 h-4 rounded-full"
              />
            ) : (
              <UserIcon className="w-6 h-6 text-gray-400" />
            )}
            <span className="text-sm font-bold text-gray-700">
              {authorName}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="py-2 h-16 flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-700">
                {questionTagline}
              </p>
            </div>
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatTimestamp(createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OpinionCard;

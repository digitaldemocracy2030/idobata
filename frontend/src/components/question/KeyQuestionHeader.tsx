import { ThumbsUp } from "lucide-react";

export interface KeyQuestionHeaderProps {
  question: string;
  voteCount: number;
}

const KeyQuestionHeader = ({ question, voteCount }: KeyQuestionHeaderProps) => {
  return (
    <div className="mb-6">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
        {question}
      </h1>
      <div className="flex items-center">
        <button
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
          type="button"
        >
          <ThumbsUp className="h-5 w-5 mr-2" />
          <span>賛同する</span>
        </button>
        <span className="ml-3 text-sm text-neutral-600">
          {voteCount}人が賛同しています
        </span>
      </div>
    </div>
  );
};

export default KeyQuestionHeader;

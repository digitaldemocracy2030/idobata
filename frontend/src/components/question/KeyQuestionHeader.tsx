import { ThumbsUp } from "lucide-react";

export interface KeyQuestionHeaderProps {
  question: string;
  tagLine?: string;
  tags?: string[];
  voteCount: number;
}

const KeyQuestionHeader = ({ question, tagLine, tags, voteCount }: KeyQuestionHeaderProps) => {
  return (
    <div className="mb-6">
      {tagLine ? (
        <>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">
            {tagLine}
          </h1>
          <p className="text-neutral-700 mb-3">{question}</p>
        </>
      ) : (
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
          {question}
        </h1>
      )}
      
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-primary-100 text-primary-800 rounded-full px-2 py-0.5 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex items-center">
        <button
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
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

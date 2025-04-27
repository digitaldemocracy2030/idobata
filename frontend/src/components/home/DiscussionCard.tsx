import React from 'react';
import { ArrowRight } from "lucide-react";

interface DiscussionCardProps {
  title: string;
  problemCount: number;
  solutionCount: number;
}

const DiscussionCard = ({ title, problemCount, solutionCount }: DiscussionCardProps) => {
  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-white hover:shadow-md transition-all duration-200 flex justify-between items-center">
      <div>
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <div className="flex text-sm text-neutral-600">
          <span className="mr-4">課題: {problemCount}</span>
          <span>解決策: {solutionCount}</span>
        </div>
      </div>
      <button className="text-neutral-700 hover:text-neutral-900">
        <ArrowRight className="h-6 w-6" />
      </button>
    </div>
  );
};

export default DiscussionCard;

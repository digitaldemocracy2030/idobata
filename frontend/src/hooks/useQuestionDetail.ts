import { useEffect, useState } from "react";
import { apiClient } from "../services/api/apiClient";
import type { Question, RelatedProblem, RelatedSolution } from "../types";

export interface QuestionDetailResponse {
  question: Question & {
    voteCount: number;
  };
  debateData: {
    axes: {
      title: string;
      options: {
        label: string;
        description: string;
      }[];
    }[];
    agreementPoints: string[];
    disagreementPoints: string[];
  };
  relatedProblems: RelatedProblem[];
  relatedSolutions: RelatedSolution[];
  reportExample: {
    introduction: string;
    issues: {
      title: string;
      description: string;
    }[];
  };
}

export function useQuestionDetail(themeId: string, questionId: string) {
  const [questionDetail, setQuestionDetail] = useState<QuestionDetailResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestionDetail = async () => {
      setIsLoading(true);
      setError(null);

      const result = await apiClient.getQuestionDetails(questionId, themeId);

      if (!result.isOk()) {
        setError(`質問の取得に失敗しました: ${result.error.message}`);
        console.error("Error fetching question detail:", result.error);
        setIsLoading(false);
        return;
      }

      setQuestionDetail(result.value);
      setIsLoading(false);
    };

    fetchQuestionDetail();
  }, [themeId, questionId]);

  return { questionDetail, isLoading, error };
}

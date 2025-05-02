import { useEffect, useState } from "react";
import { apiClient } from "../services/api/apiClient";

export interface TopPageResponse {
  latestThemes: {
    _id: string;
    title: string;
    problemCount: number;
    solutionCount: number;
  }[];
  latestQuestions: {
    _id: string;
    questionText: string;
    problemCount: number;
    solutionCount: number;
  }[];
}

export function useTopPage() {
  const [topPageData, setTopPageData] = useState<TopPageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopPageData = async () => {
      setIsLoading(true);
      setError(null);

      const result = await apiClient.getTopPageData();

      if (!result.isOk()) {
        setError(`データの取得に失敗しました: ${result.error.message}`);
        console.error("Error fetching top page data:", result.error);
        setIsLoading(false);
        return;
      }

      setTopPageData(result.value);
      setIsLoading(false);
    };

    fetchTopPageData();
  }, []);

  return { topPageData, isLoading, error };
}

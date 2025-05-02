import { useEffect, useState } from "react";
import { apiClient } from "../services/api/apiClient";

import type { Question, Theme } from "../types";

export interface TopPageResponse {
  latestThemes: Theme[];
  latestQuestions: Question[];
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

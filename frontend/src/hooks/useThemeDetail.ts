import { useEffect, useState } from "react";
import { apiClient } from "../services/api/apiClient";
import type { Problem, Question, Solution, Theme } from "../types";

// テーマ詳細データのレスポンス型
export interface ThemeDetailResponse {
  theme: Theme;
  keyQuestions: (Question & {
    voteCount: number;
    issueCount: number;
    solutionCount: number;
  })[];
  issues: Problem[];
  solutions: Solution[];
}

export function useThemeDetail(themeId: string) {
  const [themeDetail, setThemeDetail] = useState<ThemeDetailResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemeDetail = async () => {
      setIsLoading(true);
      setError(null);

      // 一回のリクエストですべてのデータを取得
      const result = await apiClient.getThemeDetail(themeId);

      if (!result.isOk()) {
        setError(`テーマの取得に失敗しました: ${result.error.message}`);
        console.error("Error fetching theme detail:", result.error);
        setIsLoading(false);
        return;
      }

      setThemeDetail(result.value);
      setIsLoading(false);
    };

    fetchThemeDetail();
  }, [themeId]);

  return { themeDetail, isLoading, error };
}

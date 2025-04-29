import { useEffect, useState } from "react";
import { apiClient } from "../services/api/apiClient";
import type { Theme } from "../types";

export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      setError(null);

      const result = await apiClient.getAllThemes();

      if (!result.isOk()) {
        setError(`テーマの取得に失敗しました: ${result.error.message}`);
        console.error("Error fetching themes:", result.error);
        setIsLoading(false);
        return;
      }

      setThemes(result.value);
      setIsLoading(false);
    };

    fetchThemes();
  }, []);

  return { themes, isLoading, error };
}

import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../services/api/apiClient";

export function useLike(targetType: string, targetId: string) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!targetId) return;

      setIsLoading(true);
      const result = await apiClient.getLikeStatus(
        targetType,
        targetId,
        user.id
      );

      if (result.isErr()) {
        console.error("Failed to fetch like status:", result.error);
        setError("Failed to fetch like status");
        setIsLoading(false);
        return;
      }

      setIsLiked(result.value.liked);
      setLikeCount(result.value.count);
      setIsLoading(false);
      setError(null);
    };

    fetchLikeStatus();
  }, [targetType, targetId, user.id]);

  const toggleLike = async () => {
    setIsLoading(true);
    const result = await apiClient.toggleLike(targetType, targetId, user.id);

    if (result.isErr()) {
      console.error("Failed to toggle like:", result.error);
      setError("Failed to toggle like");
      setIsLoading(false);
      return;
    }

    setIsLiked(result.value.liked);
    setLikeCount(result.value.count);
    setIsLoading(false);
    setError(null);
  };

  return { isLiked, likeCount, isLoading, error, toggleLike };
}

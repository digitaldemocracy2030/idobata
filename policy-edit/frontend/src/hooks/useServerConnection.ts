import { useCallback, useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export interface UseServerConnectionReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  checkStatus: () => Promise<boolean>;
}

export function useServerConnection(): UseServerConnectionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/status`);
      const data = await response.json();
      const status = data.initialized as boolean;
      setIsConnected(status);
      return status;
    } catch (err) {
      console.error("接続ステータスの確認に失敗しました:", err);
      setIsConnected(false);
      return false;
    }
  }, []);

  const connect = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/chat/connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIsConnected(true);
      } else {
        setError(data.error || "サーバーへの接続に失敗しました");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "不明なエラー";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const initiallyConnected = await checkStatus();

    if (!initiallyConnected) {
      console.log("Not connected, attempting auto-connection...");
      try {
        await connect();
        await checkStatus();
      } catch (err) {
        console.error("初期接続試行中にエラーが発生しました:", err);
        const errorMessage = err instanceof Error ? err.message : "不明な初期化エラー";
        setError(errorMessage);
        await checkStatus();
      }
    } else {
      console.log("マウント時に既に接続されています。");
    }

    setIsLoading(false);
  }, [checkStatus, connect]);

  useEffect(() => {
    initializeConnection();
  }, [initializeConnection]);

  return {
    isConnected,
    isLoading,
    error,
    connect,
    checkStatus,
  };
}

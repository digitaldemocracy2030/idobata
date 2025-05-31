import { Result } from "neverthrow";
import { useCallback, useEffect, useState } from "react";
import {
  checkConnectionStatus,
  connectToServer,
} from "../services/connectionService";
import type { ChatError } from "../types/errors";
import { formatErrorMessage } from "../utils/resultUtils";

export interface UseServerConnectionReturn {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<Result<void, ChatError>>;
  checkStatus: () => Promise<Result<boolean, ChatError>>;
}

export function useServerConnection(): UseServerConnectionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async (): Promise<
    Result<boolean, ChatError>
  > => {
    const result = await checkConnectionStatus();

    if (result.isErr()) {
      setIsConnected(false);
      setError(formatErrorMessage(result.error));
      return result;
    }

    setIsConnected(result.value);
    setError(null);
    return result;
  }, []);

  const connect = useCallback(async (): Promise<Result<void, ChatError>> => {
    setIsLoading(true);
    setError(null);

    const result = await connectToServer();

    if (result.isErr()) {
      setError(formatErrorMessage(result.error));
      setIsLoading(false);
      return result;
    }

    setIsConnected(true);
    setIsLoading(false);
    return result;
  }, []);

  const initializeConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const statusResult = await checkStatus();
    if (statusResult.isErr()) {
      setIsLoading(false);
      return;
    }

    if (!statusResult.value) {
      console.log("Not connected, attempting auto-connection...");
      const connectResult = await connect();
      if (connectResult.isErr()) {
        console.error("初期接続に失敗:", connectResult.error);
      }
    } else {
      console.log("マウント時に既に接続されています。");
      setIsLoading(false);
    }
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

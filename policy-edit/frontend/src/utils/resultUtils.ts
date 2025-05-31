import type { ChatError } from "../types/errors";

export const formatErrorMessage = (error: ChatError): string => {
  switch (error.type) {
    case "NETWORK_ERROR":
      return `ネットワークエラー: ${error.message}`;
    case "API_ERROR":
      return `APIエラー (${error.status}): ${error.message}`;
    case "VALIDATION_ERROR":
      return `入力エラー (${error.field}): ${error.message}`;
    case "STATE_ERROR":
      return `状態エラー: ${error.reason}`;
    case "PARSE_ERROR":
      return `データ解析エラー: ${error.message}`;
    default:
      return "不明なエラーが発生しました";
  }
};

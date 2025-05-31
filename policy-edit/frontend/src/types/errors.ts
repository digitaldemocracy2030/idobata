export type ChatError =
  | NetworkError
  | ApiError
  | ValidationError
  | StateError
  | ParseError;

export interface NetworkError {
  type: "NETWORK_ERROR";
  message: string;
  cause?: unknown;
}

export interface ApiError {
  type: "API_ERROR";
  status: number;
  message: string;
  endpoint: string;
}

export interface ValidationError {
  type: "VALIDATION_ERROR";
  field: string;
  message: string;
}

export interface StateError {
  type: "STATE_ERROR";
  reason: string;
  context?: Record<string, unknown>;
}

export interface ParseError {
  type: "PARSE_ERROR";
  message: string;
  data?: unknown;
}

export const createNetworkError = (
  message: string,
  cause?: unknown
): NetworkError => ({
  type: "NETWORK_ERROR",
  message,
  cause,
});

export const createApiError = (
  status: number,
  message: string,
  endpoint: string
): ApiError => ({
  type: "API_ERROR",
  status,
  message,
  endpoint,
});

export const createValidationError = (
  field: string,
  message: string
): ValidationError => ({
  type: "VALIDATION_ERROR",
  field,
  message,
});

export const createStateError = (
  reason: string,
  context?: Record<string, unknown>
): StateError => ({
  type: "STATE_ERROR",
  reason,
  context,
});

export const createParseError = (
  message: string,
  data?: unknown
): ParseError => ({
  type: "PARSE_ERROR",
  message,
  data,
});

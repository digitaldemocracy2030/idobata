export enum HttpErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  GITHUB_ERROR = "GITHUB_ERROR",
}

export interface HttpError {
  type: HttpErrorType;
  message: string;
  status?: number;
  details?: unknown;
}

export const createHttpError = (
  type: HttpErrorType,
  message: string,
  status?: number,
  details?: unknown
): HttpError => ({
  type,
  message,
  status,
  details,
});

export const createNetworkError = (
  message: string,
  details?: unknown
): HttpError =>
  createHttpError(HttpErrorType.NETWORK_ERROR, message, undefined, details);

export const createValidationError = (
  message: string,
  details?: unknown
): HttpError =>
  createHttpError(HttpErrorType.VALIDATION_ERROR, message, 400, details);

export const createServerError = (
  message: string,
  status: number,
  details?: unknown
): HttpError =>
  createHttpError(HttpErrorType.SERVER_ERROR, message, status, details);

export const createUnknownError = (
  message: string,
  details?: unknown
): HttpError =>
  createHttpError(HttpErrorType.UNKNOWN_ERROR, message, undefined, details);

export const createGitHubError = (
  message: string,
  status?: number,
  details?: unknown
): HttpError =>
  createHttpError(HttpErrorType.GITHUB_ERROR, message, status, details);

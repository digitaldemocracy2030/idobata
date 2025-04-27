export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class ApiError extends Error {
  public readonly type: ApiErrorType;
  public readonly statusCode?: number;
  public readonly originalError?: unknown;
  public readonly data?: unknown;

  constructor(
    type: ApiErrorType,
    message: string,
    options?: {
      statusCode?: number;
      originalError?: unknown;
      data?: unknown;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = options?.statusCode;
    this.originalError = options?.originalError;
    this.data = options?.data;

    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromHttpError(response: Response, data?: unknown): ApiError {
    const statusCode = response.status;
    let type: ApiErrorType;
    let message: string;

    switch (statusCode) {
      case 400:
        type = ApiErrorType.VALIDATION_ERROR;
        message = 'Invalid request data';
        break;
      case 401:
        type = ApiErrorType.UNAUTHORIZED;
        message = 'Authentication required';
        break;
      case 403:
        type = ApiErrorType.FORBIDDEN;
        message = 'Access forbidden';
        break;
      case 404:
        type = ApiErrorType.NOT_FOUND;
        message = 'Resource not found';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        type = ApiErrorType.SERVER_ERROR;
        message = 'Server error occurred';
        break;
      default:
        type = ApiErrorType.UNKNOWN_ERROR;
        message = `HTTP error! status: ${statusCode}`;
    }

    return new ApiError(type, message, { statusCode, data });
  }

  static fromNetworkError(error: Error): ApiError {
    return new ApiError(
      ApiErrorType.NETWORK_ERROR,
      'Network error occurred',
      { originalError: error }
    );
  }

  static fromTimeoutError(): ApiError {
    return new ApiError(
      ApiErrorType.TIMEOUT_ERROR,
      'Request timed out'
    );
  }

  static fromUnknownError(error: unknown): ApiError {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return new ApiError(
      ApiErrorType.UNKNOWN_ERROR,
      message,
      { originalError: error }
    );
  }
}

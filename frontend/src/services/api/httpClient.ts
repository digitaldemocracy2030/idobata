import { Result, ok, err } from "neverthrow";
import { ApiError } from "./apiError";

export type HttpResult<T> = Result<T, ApiError>;

export interface HttpClientOptions {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.timeout = options.timeout || 30000; // デフォルトタイムアウト: 30秒
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...options.headers,
    };
  }

  async get<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<HttpResult<T>> {
    return this.request<T>(endpoint, "GET", undefined, headers);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResult<T>> {
    return this.request<T>(endpoint, "POST", data, headers);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResult<T>> {
    return this.request<T>(endpoint, "PUT", data, headers);
  }

  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<HttpResult<T>> {
    return this.request<T>(endpoint, "DELETE", undefined, headers);
  }

  private async request<T>(
    endpoint: string,
    method: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResult<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      options.signal = controller.signal;

      const response = await fetch(url, options);
      clearTimeout(timeoutId);

      if (!response.ok) {
        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {}

        return err(ApiError.fromHttpError(response, responseData));
      }

      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return ok({} as T);
      }

      const responseData = await response.json();
      return ok(responseData as T);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return err(ApiError.fromTimeoutError());
        }

        if (error instanceof TypeError && error.message.includes("fetch")) {
          return err(ApiError.fromNetworkError(error));
        }
      }

      return err(ApiError.fromUnknownError(error));
    }
  }
}

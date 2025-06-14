import { Result, err, ok } from "neverthrow";
import type { HttpError } from "./errors";
import {
  createNetworkError,
  createServerError,
  createUnknownError,
} from "./errors";

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
}

export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(
    baseUrl: string,
    defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    }
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<Result<T, HttpError>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    const requestInit: RequestInit = {
      method: options.method ?? "GET",
      headers,
    };

    if (options.body && options.method !== "GET") {
      requestInit.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, requestInit);

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        return err(
          createServerError(
            errorData.error ||
              `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          )
        );
      }

      const data = await response.json();
      return ok(data as T);
    } catch (error) {
      if (error instanceof Error) {
        return err(createNetworkError("Network request failed", error));
      }
      return err(createUnknownError("Unknown error occurred", error));
    }
  }

  async get<T>(
    endpoint: string,
    options: Omit<RequestOptions, "method" | "body"> = {}
  ): Promise<Result<T, HttpError>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options: Omit<RequestOptions, "method" | "body"> = {}
  ): Promise<Result<T, HttpError>> {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  private async parseErrorResponse(
    response: Response
  ): Promise<{ error: string; details?: string }> {
    try {
      const data = await response.json();
      return data;
    } catch {
      return { error: response.statusText };
    }
  }
}

import { Result, err, ok } from "neverthrow";
import type { ChatError } from "../types/errors";
import {
  createApiError,
  createNetworkError,
  createParseError,
} from "../types/errors";

export interface RequestConfig extends RequestInit {
  timeout?: number;
}

export class HttpClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string, defaultTimeout = 10000) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.defaultTimeout = defaultTimeout;
  }

  private async safeFetch(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<Result<Response, ChatError>> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = config.timeout ?? this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return ok(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        return err(
          createNetworkError(`Request timeout (${timeout}ms): ${endpoint}`)
        );
      }

      return err(createNetworkError(`Network error: ${endpoint}`, error));
    }
  }

  private checkHttpStatus(
    response: Response,
    endpoint: string
  ): Result<Response, ChatError> {
    if (response.ok) {
      return ok(response);
    }

    return err(
      createApiError(
        response.status,
        `HTTP ${response.status}: ${response.statusText}`,
        endpoint
      )
    );
  }

  private async parseJson<T>(
    response: Response,
    endpoint: string
  ): Promise<Result<T, ChatError>> {
    try {
      const data = (await response.json()) as T;
      return ok(data);
    } catch (error) {
      return err(
        createParseError(
          `Failed to parse JSON response from ${endpoint}`,
          error
        )
      );
    }
  }

  async get<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<Result<T, ChatError>> {
    const fetchResult = await this.safeFetch(endpoint, {
      ...config,
      method: "GET",
    });

    if (fetchResult.isErr()) {
      return err(fetchResult.error);
    }

    const statusResult = this.checkHttpStatus(fetchResult.value, endpoint);
    if (statusResult.isErr()) {
      return err(statusResult.error);
    }

    return this.parseJson<T>(statusResult.value, endpoint);
  }

  async post<T, U = unknown>(
    endpoint: string,
    data?: U,
    config: RequestConfig = {}
  ): Promise<Result<T, ChatError>> {
    const requestConfig: RequestConfig = {
      ...config,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    };

    if (data !== undefined) {
      requestConfig.body = JSON.stringify(data);
    }

    const fetchResult = await this.safeFetch(endpoint, requestConfig);

    if (fetchResult.isErr()) {
      return err(fetchResult.error);
    }

    const statusResult = this.checkHttpStatus(fetchResult.value, endpoint);
    if (statusResult.isErr()) {
      return err(statusResult.error);
    }

    return this.parseJson<T>(statusResult.value, endpoint);
  }

  async put<T, U = unknown>(
    endpoint: string,
    data?: U,
    config: RequestConfig = {}
  ): Promise<Result<T, ChatError>> {
    const requestConfig: RequestConfig = {
      ...config,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
    };

    if (data !== undefined) {
      requestConfig.body = JSON.stringify(data);
    }

    const fetchResult = await this.safeFetch(endpoint, requestConfig);

    if (fetchResult.isErr()) {
      return err(fetchResult.error);
    }

    const statusResult = this.checkHttpStatus(fetchResult.value, endpoint);
    if (statusResult.isErr()) {
      return err(statusResult.error);
    }

    return this.parseJson<T>(statusResult.value, endpoint);
  }

  async delete<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<Result<T, ChatError>> {
    const fetchResult = await this.safeFetch(endpoint, {
      ...config,
      method: "DELETE",
    });

    if (fetchResult.isErr()) {
      return err(fetchResult.error);
    }

    const statusResult = this.checkHttpStatus(fetchResult.value, endpoint);
    if (statusResult.isErr()) {
      return err(statusResult.error);
    }

    return this.parseJson<T>(statusResult.value, endpoint);
  }

  async request(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<Result<void, ChatError>> {
    const fetchResult = await this.safeFetch(endpoint, config);

    if (fetchResult.isErr()) {
      return err(fetchResult.error);
    }

    const statusResult = this.checkHttpStatus(fetchResult.value, endpoint);
    if (statusResult.isErr()) {
      return err(statusResult.error);
    }

    return ok(undefined);
  }
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
export const httpClient = new HttpClient(API_BASE_URL);

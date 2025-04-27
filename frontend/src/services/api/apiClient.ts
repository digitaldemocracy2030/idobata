import { Result, ok, err, ResultAsync } from 'neverthrow';
import { HttpClient, HttpResult } from './httpClient';
import { ApiError, ApiErrorType } from './apiError';
import {
  Theme,
  Question,
  QuestionDetails,
  Problem,
  Solution,
  PolicyDraft,
  DigestDraft
} from '../../types';

interface RetryOptions {
  maxRetries: number;
  delayMs: number;
  shouldRetry: (error: ApiError) => boolean;
}

const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  delayMs: 1000,
  shouldRetry: (error: ApiError) => {
    return (
      error.type === ApiErrorType.NETWORK_ERROR ||
      error.type === ApiErrorType.SERVER_ERROR
    );
  }
};

export class ApiClient {
  private httpClient: HttpClient;
  private retryOptions: RetryOptions;

  constructor() {
    const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/api`;
    this.httpClient = new HttpClient({
      baseUrl,
      timeout: 30000
    });
    this.retryOptions = defaultRetryOptions;
  }

  private async withRetry<T>(
    operation: () => Promise<HttpResult<T>>,
    options: Partial<RetryOptions> = {}
  ): Promise<HttpResult<T>> {
    const retryOpts = { ...this.retryOptions, ...options };
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= retryOpts.maxRetries; attempt++) {
      const result = await operation();

      if (result.isOk()) {
        return result;
      }

      lastError = result.error;

      if (attempt >= retryOpts.maxRetries || !retryOpts.shouldRetry(lastError)) {
        return err(lastError);
      }

      await new Promise(resolve => setTimeout(resolve, retryOpts.delayMs));
    }

    return err(lastError || new ApiError(ApiErrorType.UNKNOWN_ERROR, 'Unknown error occurred'));
  }

  async getAllThemes(): Promise<HttpResult<Theme[]>> {
    return this.withRetry(() => this.httpClient.get<Theme[]>('/themes'));
  }

  async getThemeById(id: string): Promise<HttpResult<Theme>> {
    return this.withRetry(() => this.httpClient.get<Theme>(`/themes/${id}`));
  }

  async getDefaultTheme(): Promise<HttpResult<Theme>> {
    const themesResult = await this.getAllThemes();

    return themesResult.andThen(themes => {
      const defaultTheme = themes.find(theme => theme.slug === 'default') || themes[0];
      if (!defaultTheme) {
        return err(new ApiError(ApiErrorType.NOT_FOUND, 'Default theme not found'));
      }
      return ok(defaultTheme);
    });
  }

  async getAllQuestions(): Promise<HttpResult<Question[]>> {
    return this.withRetry(() => this.httpClient.get<Question[]>('/questions'));
  }

  async getQuestionsByTheme(themeId: string): Promise<HttpResult<Question[]>> {
    return this.withRetry(() =>
      this.httpClient.get<Question[]>(`/themes/${themeId}/questions`)
    );
  }

  async getQuestionDetails(questionId: string, themeId?: string): Promise<HttpResult<QuestionDetails>> {
    const endpoint = themeId
      ? `/themes/${themeId}/questions/${questionId}/details`
      : `/questions/${questionId}/details`;

    return this.withRetry(() => this.httpClient.get<QuestionDetails>(endpoint));
  }

  async generateQuestions(themeId?: string): Promise<HttpResult<void>> {
    const endpoint = themeId
      ? `/themes/${themeId}/generate-questions`
      : `/admin/generate-questions`;

    return this.withRetry(() => this.httpClient.post<void>(endpoint));
  }

  async getAllProblems(): Promise<HttpResult<Problem[]>> {
    return this.withRetry(() => this.httpClient.get<Problem[]>('/admin/problems'));
  }

  async getProblemsByTheme(themeId: string): Promise<HttpResult<Problem[]>> {
    return this.withRetry(() =>
      this.httpClient.get<Problem[]>(`/themes/${themeId}/problems`)
    );
  }

  async getAllSolutions(): Promise<HttpResult<Solution[]>> {
    return this.withRetry(() => this.httpClient.get<Solution[]>('/admin/solutions'));
  }

  async getSolutionsByTheme(themeId: string): Promise<HttpResult<Solution[]>> {
    return this.withRetry(() =>
      this.httpClient.get<Solution[]>(`/themes/${themeId}/solutions`)
    );
  }

  async getAllPolicyDrafts(): Promise<HttpResult<PolicyDraft[]>> {
    return this.withRetry(() => this.httpClient.get<PolicyDraft[]>('/policy-drafts'));
  }

  async getPolicyDraftsByTheme(themeId: string): Promise<HttpResult<PolicyDraft[]>> {
    return this.withRetry(() =>
      this.httpClient.get<PolicyDraft[]>(`/themes/${themeId}/policy-drafts`)
    );
  }

  async getAllDigestDrafts(): Promise<HttpResult<DigestDraft[]>> {
    return this.withRetry(() => this.httpClient.get<DigestDraft[]>('/digest-drafts'));
  }

  async getDigestDraftsByTheme(themeId: string): Promise<HttpResult<DigestDraft[]>> {
    return this.withRetry(() =>
      this.httpClient.get<DigestDraft[]>(`/themes/${themeId}/digest-drafts`)
    );
  }

  async getThreadExtractions(threadId: string): Promise<HttpResult<{ problems: Problem[], solutions: Solution[] }>> {
    return this.withRetry(() =>
      this.httpClient.get<{ problems: Problem[], solutions: Solution[] }>(`/chat/threads/${threadId}/extractions`)
    );
  }

  async getThreadMessages(threadId: string): Promise<HttpResult<{ messages: any[] }>> {
    return this.withRetry(() =>
      this.httpClient.get<{ messages: any[] }>(`/chat/threads/${threadId}/messages`)
    );
  }

  async sendMessage(userId: string, message: string, threadId?: string): Promise<HttpResult<{ response: string; threadId: string; userId: string }>> {
    return this.withRetry(() =>
      this.httpClient.post<{ response: string; threadId: string; userId: string }>(
        `/chat/messages`,
        {
          userId,
          message,
          threadId
        }
      )
    );
  }

  async getPolicyDraftsByQuestion(themeId: string, questionId: string): Promise<HttpResult<PolicyDraft[]>> {
    return this.withRetry(() =>
      this.httpClient.get<PolicyDraft[]>(`/themes/${themeId}/policy-drafts?questionId=${questionId}`)
    );
  }

  async getDigestDraftsByQuestion(themeId: string, questionId: string): Promise<HttpResult<DigestDraft[]>> {
    return this.withRetry(() =>
      this.httpClient.get<DigestDraft[]>(`/themes/${themeId}/digest-drafts?questionId=${questionId}`)
    );
  }

  async generatePolicy(themeId: string, questionId: string): Promise<HttpResult<void>> {
    return this.withRetry(() =>
      this.httpClient.post<void>(`/themes/${themeId}/questions/${questionId}/generate-policy`)
    );
  }

  async generateDigest(themeId: string, questionId: string): Promise<HttpResult<void>> {
    return this.withRetry(() =>
      this.httpClient.post<void>(`/themes/${themeId}/questions/${questionId}/generate-digest`)
    );
  }
}

export const apiClient = new ApiClient();

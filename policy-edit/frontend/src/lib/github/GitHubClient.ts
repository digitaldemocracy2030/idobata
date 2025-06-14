import { Result, err, ok } from "neverthrow";
import type { HttpError } from "../errors";
import { createGitHubError } from "../errors";
import { HttpClient } from "../httpClient";
import type {
  GitHubDirectoryItem,
  GitHubFile,
  IGitHubClient,
} from "./IGitHubClient";

export function decodeBase64Content(
  base64String: string
): Result<string, HttpError> {
  try {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return ok(new TextDecoder().decode(bytes));
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "InvalidCharacterError"
    ) {
      return err(createGitHubError("Invalid Base64 string"));
    }
    return err(createGitHubError("Error decoding content"));
  }
}

export class GitHubClient implements IGitHubClient {
  private httpClient: HttpClient;

  constructor(token?: string) {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      ...(token && { Authorization: `token ${token}` }),
    };
    this.httpClient = new HttpClient("https://api.github.com", headers);
  }

  async fetchContent(
    owner: string,
    repo: string,
    path = "",
    ref?: string
  ): Promise<Result<GitHubFile | GitHubDirectoryItem[], HttpError>> {
    if (!owner || !repo) {
      return err(createGitHubError("Repository owner and name are required."));
    }

    let endpoint = `/repos/${owner}/${repo}/contents/${path}`;
    if (ref) {
      endpoint += `?ref=${encodeURIComponent(ref)}`;
    }

    const result = await this.httpClient.get<
      GitHubFile | GitHubDirectoryItem[]
    >(endpoint);

    return result.mapErr((error) => {
      if (error.type === "NETWORK_ERROR") {
        return error;
      }

      if (error.status) {
        const httpErrorMatch = error.message.match(/^HTTP (\d+): (.+)$/);
        const statusText = httpErrorMatch ? httpErrorMatch[2] : error.message;

        if (error.status === 404) {
          const errorMessage = `GitHub API error: 404 Not Found - ${statusText} (Not Found)`;
          return createGitHubError(errorMessage, error.status);
        }

        if (error.status === 403) {
          const isRateLimit =
            error.details &&
            typeof error.details === "object" &&
            "message" in error.details &&
            typeof error.details.message === "string" &&
            error.details.message.includes("rate limit exceeded");

          if (isRateLimit) {
            const details = error.details as { message: string };
            const errorMessage = `GitHub API error: 403 Forbidden - ${details.message} (Rate limit exceeded)`;
            return createGitHubError(errorMessage, error.status);
          }

          const errorMessage = `GitHub API error: 403 ${statusText}`;
          return createGitHubError(errorMessage, error.status);
        }

        if (error.status === 500) {
          const errorMessage = `GitHub API error: 500 Internal Server Error - ${statusText}`;
          return createGitHubError(errorMessage, error.status);
        }

        const errorMessage = `GitHub API error: ${error.status} ${statusText}`;
        return createGitHubError(errorMessage, error.status);
      }

      const errorMessage = `GitHub API error: ${error.message}`;
      return createGitHubError(errorMessage, error.status);
    });
  }

  decodeBase64Content(base64String: string): Result<string, HttpError> {
    return decodeBase64Content(base64String);
  }
}

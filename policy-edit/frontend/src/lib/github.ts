import { Result, err, ok } from "neverthrow";
import type { HttpError } from "./errors";
import { createGitHubError } from "./errors";
import { HttpClient } from "./httpClient";

export interface GitHubDirectoryItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir" | "symlink" | "submodule";
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file";
  content: string;
  encoding: "base64";
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export class GitHubClient {
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
      // Handle network errors differently - don't add "GitHub API error:" prefix
      if (error.type === "NETWORK_ERROR") {
        return error;
      }

      // For HTTP errors, format the message properly
      if (error.status) {
        // Extract status text from the error message if it follows "HTTP {status}: {statusText}" format
        const httpErrorMatch = error.message.match(/^HTTP (\d+): (.+)$/);
        const statusText = httpErrorMatch ? httpErrorMatch[2] : error.message;

        if (error.status === 404) {
          // For 404, include the response message from GitHub API
          const errorMessage = `GitHub API error: 404 Not Found - ${statusText} (Not Found)`;
          return createGitHubError(errorMessage, error.status);
        }

        if (error.status === 403) {
          // Check if this is a rate limit error by looking at the error details
          const isRateLimit =
            error.details &&
            typeof error.details === "object" &&
            "message" in error.details &&
            typeof error.details.message === "string" &&
            error.details.message.includes("rate limit exceeded");

          if (isRateLimit) {
            // For rate limit errors, format with the API message
            const details = error.details as { message: string };
            const errorMessage = `GitHub API error: 403 Forbidden - ${details.message} (Rate limit exceeded)`;
            return createGitHubError(errorMessage, error.status);
          }

          // For other 403 errors, use standard format
          const errorMessage = `GitHub API error: 403 ${statusText}`;
          return createGitHubError(errorMessage, error.status);
        }

        if (error.status === 500) {
          // For 500 errors, format with status and message
          const errorMessage = `GitHub API error: 500 Internal Server Error - ${statusText}`;
          return createGitHubError(errorMessage, error.status);
        }

        // For other HTTP errors like 502, format as "GitHub API error: {status} {statusText}"
        const errorMessage = `GitHub API error: ${error.status} ${statusText}`;
        return createGitHubError(errorMessage, error.status);
      }

      // Fallback for other errors
      const errorMessage = `GitHub API error: ${error.message}`;
      return createGitHubError(errorMessage, error.status);
    });
  }

  decodeBase64Content(base64String: string): Result<string, HttpError> {
    return decodeBase64Content(base64String);
  }
}

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

import { Result, err, ok } from "neverthrow";
import type { HttpError } from "./errors";
import {
  createGitHubError,
  createNetworkError,
  createUnknownError,
} from "./errors";

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

interface GitHubApiError {
  message: string;
  documentation_url: string;
}

export class GitHubClient {
  private readonly baseUrl = "https://api.github.com";
  private readonly defaultHeaders: Record<string, string>;

  constructor(token?: string) {
    this.defaultHeaders = {
      Accept: "application/vnd.github.v3+json",
      ...(token && { Authorization: `token ${token}` }),
    };
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

    let apiUrl = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`;
    if (ref) {
      apiUrl += `?ref=${encodeURIComponent(ref)}`;
    }

    try {
      const response = await fetch(apiUrl, {
        headers: this.defaultHeaders,
      });

      if (!response.ok) {
        let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;
        try {
          const errorData: GitHubApiError = await response.json();
          errorMessage += ` - ${errorData.message}`;
          if (
            response.status === 403 &&
            errorData.message.includes("rate limit exceeded")
          ) {
            errorMessage += " (Rate limit exceeded)";
          } else if (response.status === 404) {
            errorMessage += " (Not Found)";
          }
        } catch {}
        return err(createGitHubError(errorMessage, response.status));
      }

      const data: GitHubFile | GitHubDirectoryItem[] = await response.json();
      return ok(data);
    } catch (error) {
      if (error instanceof Error) {
        return err(createNetworkError("Network request failed", error));
      }
      return err(
        createUnknownError("An unknown error occurred during fetch.", error)
      );
    }
  }

  decodeBase64Content(base64String: string): Result<string, HttpError> {
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
}

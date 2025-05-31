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
      let errorMessage = `GitHub API error: ${error.message}`;
      if (
        error.status === 403 &&
        error.message.includes("rate limit exceeded")
      ) {
        errorMessage += " (Rate limit exceeded)";
      } else if (error.status === 404) {
        errorMessage += " (Not Found)";
      }
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

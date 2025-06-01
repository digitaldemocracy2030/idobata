import type { Result } from "neverthrow";
import type { HttpError } from "../errors";

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

export interface IGitHubClient {
  fetchContent(
    owner: string,
    repo: string,
    path?: string,
    ref?: string
  ): Promise<Result<GitHubFile | GitHubDirectoryItem[], HttpError>>;

  decodeBase64Content(base64String: string): Result<string, HttpError>;
}

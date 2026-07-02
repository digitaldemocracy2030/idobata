import type { Result } from "neverthrow";
import type { HttpError } from "../errors";
import type {
  GitHubDirectoryItem,
  GitHubFile,
  IGitHubClient,
} from "./IGitHubClient";

/**
 * Normalize a target path env value into a repo-relative prefix without
 * leading/trailing slashes (e.g. "/docs/policies/" -> "docs/policies").
 */
export function normalizeTargetPath(targetPath?: string): string {
  if (!targetPath) return "";
  return targetPath.trim().replace(/^\/+|\/+$/g, "");
}

/**
 * Decorates an IGitHubClient so that all reads are confined to a subdirectory
 * of the repository. Requests are prefixed with the base path, and repo-absolute
 * paths returned by the GitHub API are stripped back to base-relative paths so
 * that the rest of the app never needs to know the full path.
 */
export class ScopedGitHubClient implements IGitHubClient {
  private readonly basePath: string;

  constructor(
    private readonly inner: IGitHubClient,
    basePath: string
  ) {
    this.basePath = normalizeTargetPath(basePath);
  }

  private toRepoPath(path: string): string {
    const relative = path.replace(/^\/+/, "");
    if (!this.basePath) return relative;
    return relative ? `${this.basePath}/${relative}` : this.basePath;
  }

  private toRelativePath(repoPath: string): string {
    if (!this.basePath) return repoPath;
    if (repoPath === this.basePath) return "";
    const prefix = `${this.basePath}/`;
    return repoPath.startsWith(prefix)
      ? repoPath.slice(prefix.length)
      : repoPath;
  }

  async fetchContent(
    owner: string,
    repo: string,
    path = "",
    ref?: string
  ): Promise<Result<GitHubFile | GitHubDirectoryItem[], HttpError>> {
    const result = await this.inner.fetchContent(
      owner,
      repo,
      this.toRepoPath(path),
      ref
    );

    return result.map((value) => {
      if (Array.isArray(value)) {
        return value.map((item) => ({
          ...item,
          path: this.toRelativePath(item.path),
        }));
      }
      return { ...value, path: this.toRelativePath(value.path) };
    });
  }

  decodeBase64Content(base64String: string): Result<string, HttpError> {
    return this.inner.decodeBase64Content(base64String);
  }
}

import { Result, err, ok } from "neverthrow";
import type { HttpError } from "../errors";
import { createGitHubError } from "../errors";
import { decodeBase64Content } from "./GitHubClient";
import type {
  GitHubDirectoryItem,
  GitHubFile,
  IGitHubClient,
} from "./IGitHubClient";
import { mockDirectoryContents, mockFileContents } from "./mockData";

export class MockGitHubClient implements IGitHubClient {
  async fetchContent(
    owner: string,
    repo: string,
    path = "",
    _ref?: string
  ): Promise<Result<GitHubFile | GitHubDirectoryItem[], HttpError>> {
    if (!owner || !repo) {
      return err(createGitHubError("Repository owner and name are required."));
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    if (mockFileContents[path]) {
      return ok(mockFileContents[path]);
    }

    if (mockDirectoryContents[path]) {
      return ok(mockDirectoryContents[path]);
    }

    return err(
      createGitHubError(
        `GitHub API error: 404 Not Found - ${path} (Not Found)`,
        404
      )
    );
  }

  decodeBase64Content(base64String: string): Result<string, HttpError> {
    return decodeBase64Content(base64String);
  }
}

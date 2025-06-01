import { GitHubClient } from "./GitHubClient";
import type { IGitHubClient } from "./IGitHubClient";
import { MockGitHubClient } from "./MockGitHubClient";

export function createGitHubClient(token?: string): IGitHubClient {
  const useMock = import.meta.env.VITE_USE_MOCK_GITHUB_CLIENT === "true";

  if (useMock) {
    return new MockGitHubClient();
  }

  return new GitHubClient(token);
}

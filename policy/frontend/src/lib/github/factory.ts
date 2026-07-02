import { CachedGitHubClient } from "./CachedGitHubClient";
import type { IGitHubClient } from "./IGitHubClient";
import { MockGitHubClient } from "./MockGitHubClient";
import { ScopedGitHubClient, normalizeTargetPath } from "./ScopedGitHubClient";

export function createGitHubClient(token?: string): IGitHubClient {
  const useMock = import.meta.env.VITE_USE_MOCK_GITHUB_CLIENT === "true";

  if (useMock) {
    return new MockGitHubClient();
  }

  const client = new CachedGitHubClient(token);

  const targetPath = normalizeTargetPath(
    import.meta.env.VITE_GITHUB_TARGET_PATH
  );
  if (targetPath) {
    return new ScopedGitHubClient(client, targetPath);
  }

  return client;
}

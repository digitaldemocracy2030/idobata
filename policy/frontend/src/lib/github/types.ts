import type { GitHubDirectoryItem, GitHubFile } from "./IGitHubClient";

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface GitHubClientCache {
  [key: string]: CacheEntry<GitHubFile | GitHubDirectoryItem[]>;
}

export interface CacheStats {
  totalEntries: number;
  expiredEntries: number;
}

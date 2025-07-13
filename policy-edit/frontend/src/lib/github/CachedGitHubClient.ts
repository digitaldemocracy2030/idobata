import { Result, ok } from "neverthrow";
import type { HttpError } from "../errors";
import { GitHubClient } from "./GitHubClient";
import type {
  GitHubDirectoryItem,
  GitHubFile,
  IGitHubClient,
} from "./IGitHubClient";
import type { CacheEntry, CacheStats, GitHubClientCache } from "./types";

export class CachedGitHubClient extends GitHubClient implements IGitHubClient {
  private cache: GitHubClientCache = {};
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1時間（ミリ秒）
  private cleanupInterval: number | null = null;
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000; // 10分間隔

  constructor(token?: string) {
    super(token);
    this.startCleanupTimer();
  }

  async fetchContent(
    owner: string,
    repo: string,
    path = "",
    ref?: string
  ): Promise<Result<GitHubFile | GitHubDirectoryItem[], HttpError>> {
    const cacheKey = this.generateCacheKey(owner, repo, path, ref);

    // キャッシュチェック
    const cachedEntry = this.getCachedEntry(cacheKey);
    if (cachedEntry) {
      console.log(`Cache hit for: ${cacheKey}`);
      return ok(cachedEntry.data);
    }

    // キャッシュミス - 親クラスのfetchContentを呼び出し
    console.log(`Cache miss for: ${cacheKey}`);
    const result = await super.fetchContent(owner, repo, path, ref);

    // 成功時のみキャッシュに保存
    if (result.isOk()) {
      this.setCacheEntry(cacheKey, result.value);
    }

    return result;
  }

  private generateCacheKey(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ): string {
    const basePath = `${owner}/${repo}/${path}`;
    return ref ? `${basePath}?ref=${ref}` : basePath;
  }

  private getCachedEntry(
    key: string
  ): CacheEntry<GitHubFile | GitHubDirectoryItem[]> | null {
    const entry = this.cache[key];
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      // 期限切れエントリを削除
      delete this.cache[key];
      return null;
    }

    return entry;
  }

  private setCacheEntry(
    key: string,
    data: GitHubFile | GitHubDirectoryItem[]
  ): void {
    const now = Date.now();
    this.cache[key] = {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION,
    };
  }

  private startCleanupTimer(): void {
    this.cleanupInterval = window.setInterval(() => {
      this.clearExpiredCache();
    }, this.CLEANUP_INTERVAL);
  }

  // キャッシュ管理メソッド
  public clearCache(): void {
    this.cache = {};
    console.log("Cache cleared");
  }

  public clearExpiredCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const key of Object.keys(this.cache)) {
      if (now > this.cache[key].expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      delete this.cache[key];
    }

    if (keysToDelete.length > 0) {
      console.log(`Cleared ${keysToDelete.length} expired cache entries`);
    }
  }

  public getCacheStats(): CacheStats {
    const now = Date.now();
    const totalEntries = Object.keys(this.cache).length;
    const expiredEntries = Object.values(this.cache).filter(
      (entry) => now > entry.expiresAt
    ).length;

    return { totalEntries, expiredEntries };
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clearCache();
    console.log("CachedGitHubClient destroyed");
  }
}

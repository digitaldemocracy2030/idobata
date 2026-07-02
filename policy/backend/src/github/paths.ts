import { GITHUB_TARGET_PATH } from "../config.js";

/**
 * フロントエンドから渡される (対象フォルダ相対の) ファイルパスを、
 * GITHUB_TARGET_PATH を前置したリポジトリ絶対パスに解決する。
 *
 * - 先頭のスラッシュは除去する
 * - `..` を含むパスはフォルダ外へのアクセスとみなして拒否する
 * - GITHUB_TARGET_PATH が未設定の場合は従来どおりリポジトリ全体が対象
 */
export function resolveTargetPath(
  relativePath: string,
  basePath: string = GITHUB_TARGET_PATH
): string {
  const normalized = relativePath.replace(/^\/+/, "");

  const segments = normalized.split("/");
  if (segments.some((segment) => segment === "..")) {
    throw new Error(
      `Invalid path: "${relativePath}" must not contain '..' path segments`
    );
  }

  if (!basePath) {
    return normalized;
  }

  return normalized ? `${basePath}/${normalized}` : basePath;
}

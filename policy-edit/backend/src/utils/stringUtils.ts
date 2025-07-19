/**
 * ファイルコンテンツからトレーリングの空白行と区切り（---）を削除する
 * @param content トリムする対象のコンテンツ
 * @returns トリムされたコンテンツ
 */
export function trimTrailingContentSeparators(content: string): string {
  if (!content) return content;

  let trimmed = content.trimEnd();

  while (trimmed.endsWith("---")) {
    trimmed = trimmed.slice(0, -3).trimEnd();
  }

  return trimmed;
}

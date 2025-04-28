// GitHub APIレスポンスの型定義 (必要に応じて詳細化)
// ディレクトリの場合
export interface GitHubDirectoryItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

// ファイルの場合
export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file';
  content: string; // Base64 encoded content
  encoding: 'base64';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

// APIエラーレスポンスの型 (簡略版)
interface GitHubApiError {
  message: string;
  documentation_url: string;
}

/**
 * GitHub Contents APIからファイルまたはディレクトリの情報を取得します。
 * @param owner リポジトリのオーナー名
 * @param repo リポジトリ名
 * @param path 取得するファイルまたはディレクトリのパス (ルートの場合は空文字列)
 * @param ref 取得するブランチ名、タグ名、またはコミットSHA (オプション)
 * @returns 成功時はファイル情報(GitHubFile)またはディレクトリ情報(GitHubDirectoryItem[])、失敗時はエラーをスロー
 */
export async function fetchGitHubContent(
  owner: string,
  repo: string,
  path = '',
  ref?: string // Add optional ref parameter
): Promise<GitHubFile | GitHubDirectoryItem[]> {
  if (!owner || !repo) {
    throw new Error('Repository owner and name are required.');
  }

  let apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  if (ref) {
    apiUrl += `?ref=${encodeURIComponent(ref)}`; // Append ref query parameter if provided
  }
  console.log(`Fetching from GitHub API: ${apiUrl}`); // デバッグ用ログ

  try {
    const response = await fetch(apiUrl, {
      headers: {
        // パブリックリポジトリなので認証は不要だが、レート制限緩和のために
        // トークンがある場合は設定することも可能 (今回は不要)
        // 'Authorization': `token YOUR_GITHUB_TOKEN`
        Accept: 'application/vnd.github.v3+json', // APIバージョン指定
      },
    });

    if (!response.ok) {
      let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;
      try {
        // エラーレスポンスに詳細が含まれている場合がある
        const errorData: GitHubApiError = await response.json();
        errorMessage += ` - ${errorData.message}`;
        if (
          response.status === 403 &&
          errorData.message.includes('rate limit exceeded')
        ) {
          errorMessage += ' (Rate limit exceeded)';
        } else if (response.status === 404) {
          errorMessage += ' (Not Found)';
        }
      } catch (jsonError) {
        // JSONパース失敗時はステータス情報のみ
      }
      console.error(errorMessage); // エラーログ
      throw new Error(errorMessage);
    }

    const data: GitHubFile | GitHubDirectoryItem[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching GitHub content:', error);
    // fetch自体が失敗した場合 (ネットワークエラーなど)
    if (error instanceof Error) {
      throw error; // 元のエラーを再スロー
    }
    throw new Error('An unknown error occurred during fetch.');
  }
}

/**
 * Base64エンコードされた文字列をUTF-8文字列にデコードします。
 * @param base64String Base64エンコードされた文字列
 * @returns デコードされたUTF-8文字列
 */
export function decodeBase64Content(base64String: string): string {
  try {
    const binaryString = atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (error) {
    console.error('Error decoding Base64 content:', error);
    if (
      error instanceof DOMException &&
      error.name === 'InvalidCharacterError'
    ) {
      return 'Error: Invalid Base64 string';
    }
    return 'Error decoding content'; // General error message
  }
}

# GitHub Client Mock実装設計書

## 概要
GitHub APIのrate limit問題を解決するため、GitHubClientをinterface化し、実際のAPIクライアントとmockクライアントを環境変数で切り替え可能にする。

## 現在の問題
- `policy-edit/frontend/src/lib/github.ts`のGitHubClientが直接GitHub APIを呼び出している
- 開発中にrate limitに達してしまう
- デバッグ時に安定したテストデータが必要

## 設計方針

### 1. Interface抽象化
```typescript
interface IGitHubClient {
  fetchContent(
    owner: string,
    repo: string,
    path?: string,
    ref?: string
  ): Promise<Result<GitHubFile | GitHubDirectoryItem[], HttpError>>;

  decodeBase64Content(base64String: string): Result<string, HttpError>;
}
```

### 2. 実装クラス構造
```
IGitHubClient (interface)
├── GitHubClient (実際のAPI呼び出し)
└── MockGitHubClient (固定サンプルデータ)
```

### 3. 環境変数による切り替え
- `VITE_USE_MOCK_GITHUB_CLIENT`: boolean (デフォルト: false)
- docker-compose.ymlで環境変数を設定
- api.tsでclient instanceを環境変数に基づいて生成

## 実装計画

### Phase 1: Interface定義とリファクタリング
1. `IGitHubClient` interfaceを定義
2. 既存の`GitHubClient`を`IGitHubClient`を実装するように修正
3. 新しいディレクトリ構造を作成

### Phase 2: Mock実装
1. `MockGitHubClient`クラスを作成
2. 固定のサンプルデータを定義
3. GitHub APIと同じレスポンス形式でデータを返す

### Phase 3: Factory Pattern実装
1. `createGitHubClient()` factory関数を作成
2. 環境変数に基づいてclientを選択
3. `api.ts`でfactory関数を使用

### Phase 4: Docker設定更新
1. docker-compose.ymlに環境変数を追加
2. 開発環境ではmockを使用するように設定

## ファイル構成

```
policy-edit/frontend/src/lib/
├── github/
│   ├── index.ts (export all)
│   ├── IGitHubClient.ts (interface定義)
│   ├── GitHubClient.ts (実際のAPI)
│   ├── MockGitHubClient.ts (mock実装)
│   ├── mockData.ts (サンプルデータ)
│   └── factory.ts (client factory)
├── github.ts (既存、後方互換性のため残す)
└── api.ts (factory使用に更新)
```

## Mock データ構造

### ディレクトリ構造例
```
/
├── README.md
├── src/
│   ├── components/
│   │   └── Button.tsx
│   └── utils/
│       └── helpers.ts
└── package.json
```

### サンプルファイル内容
- README.md: プロジェクト説明
- Button.tsx: Reactコンポーネント例
- helpers.ts: ユーティリティ関数例
- package.json: 依存関係定義

## 環境変数設定

### docker-compose.yml
```yaml
policy-frontend:
  environment:
    - VITE_USE_MOCK_GITHUB_CLIENT=true  # 開発時はmock使用
```

### 本番環境
```yaml
policy-frontend:
  environment:
    - VITE_USE_MOCK_GITHUB_CLIENT=false  # 本番時は実際のAPI（デフォルト）
```

## テスト戦略
1. 既存のテストは`GitHubClient`に対して実行
2. `MockGitHubClient`用の新しいテストを追加
3. Factory関数のテストを追加

## 後方互換性
- 既存の`github.ts`は残し、新しいfactory経由でexport
- 既存のimport文は変更不要
- 段階的な移行が可能

## 実装順序
1. Interface定義とディレクトリ構造作成
2. 既存GitHubClientのリファクタリング
3. MockGitHubClient実装
4. Factory Pattern実装
5. Docker設定更新
6. テスト追加

この設計により、開発時はrate limitを気にせずに安定したテストデータでデバッグでき、本番時は実際のGitHub APIを使用できます。

## 具体的な実装コード

### 1. IGitHubClient.ts (Interface定義)
```typescript
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
```

### 2. mockData.ts (サンプルデータ)
```typescript
import type { GitHubDirectoryItem, GitHubFile } from "./IGitHubClient";

export const mockDirectoryData: GitHubDirectoryItem[] = [
  {
    name: "README.md",
    path: "README.md",
    sha: "abc123",
    size: 1024,
    url: "https://api.github.com/repos/mock/repo/contents/README.md",
    html_url: "https://github.com/mock/repo/blob/main/README.md",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/abc123",
    download_url: "https://raw.githubusercontent.com/mock/repo/main/README.md",
    type: "file",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/README.md",
      git: "https://api.github.com/repos/mock/repo/git/blobs/abc123",
      html: "https://github.com/mock/repo/blob/main/README.md"
    }
  },
  {
    name: "src",
    path: "src",
    sha: "def456",
    size: 0,
    url: "https://api.github.com/repos/mock/repo/contents/src",
    html_url: "https://github.com/mock/repo/tree/main/src",
    git_url: "https://api.github.com/repos/mock/repo/git/trees/def456",
    download_url: null,
    type: "dir",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/src",
      git: "https://api.github.com/repos/mock/repo/git/trees/def456",
      html: "https://github.com/mock/repo/tree/main/src"
    }
  },
  {
    name: "package.json",
    path: "package.json",
    sha: "ghi789",
    size: 512,
    url: "https://api.github.com/repos/mock/repo/contents/package.json",
    html_url: "https://github.com/mock/repo/blob/main/package.json",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/ghi789",
    download_url: "https://raw.githubusercontent.com/mock/repo/main/package.json",
    type: "file",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/package.json",
      git: "https://api.github.com/repos/mock/repo/git/blobs/ghi789",
      html: "https://github.com/mock/repo/blob/main/package.json"
    }
  }
];

export const mockFileContents: Record<string, GitHubFile> = {
  "README.md": {
    name: "README.md",
    path: "README.md",
    sha: "abc123",
    size: 1024,
    url: "https://api.github.com/repos/mock/repo/contents/README.md",
    html_url: "https://github.com/mock/repo/blob/main/README.md",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/abc123",
    download_url: "https://raw.githubusercontent.com/mock/repo/main/README.md",
    type: "file",
    content: btoa("# Mock Repository\n\nThis is a mock repository for testing purposes.\n\n## Features\n- Mock data\n- Rate limit free\n- Consistent responses"),
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/README.md",
      git: "https://api.github.com/repos/mock/repo/git/blobs/abc123",
      html: "https://github.com/mock/repo/blob/main/README.md"
    }
  },
  "package.json": {
    name: "package.json",
    path: "package.json",
    sha: "ghi789",
    size: 512,
    url: "https://api.github.com/repos/mock/repo/contents/package.json",
    html_url: "https://github.com/mock/repo/blob/main/package.json",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/ghi789",
    download_url: "https://raw.githubusercontent.com/mock/repo/main/package.json",
    type: "file",
    content: btoa('{\n  "name": "mock-repo",\n  "version": "1.0.0",\n  "description": "Mock repository for testing",\n  "main": "index.js",\n  "scripts": {\n    "test": "echo \\"Error: no test specified\\" && exit 1"\n  }\n}'),
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/package.json",
      git: "https://api.github.com/repos/mock/repo/git/blobs/ghi789",
      html: "https://github.com/mock/repo/blob/main/package.json"
    }
  },
  "src/components/Button.tsx": {
    name: "Button.tsx",
    path: "src/components/Button.tsx",
    sha: "jkl012",
    size: 256,
    url: "https://api.github.com/repos/mock/repo/contents/src/components/Button.tsx",
    html_url: "https://github.com/mock/repo/blob/main/src/components/Button.tsx",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
    download_url: "https://raw.githubusercontent.com/mock/repo/main/src/components/Button.tsx",
    type: "file",
    content: btoa('interface ButtonProps {\n  children: React.ReactNode;\n  onClick?: () => void;\n}\n\nexport function Button({ children, onClick }: ButtonProps) {\n  return (\n    <button onClick={onClick}>\n      {children}\n    </button>\n  );\n}'),
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/src/components/Button.tsx",
      git: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
      html: "https://github.com/mock/repo/blob/main/src/components/Button.tsx"
    }
  }
};

export const mockDirectoryContents: Record<string, GitHubDirectoryItem[]> = {
  "": mockDirectoryData,
  "src": [
    {
      name: "components",
      path: "src/components",
      sha: "mno345",
      size: 0,
      url: "https://api.github.com/repos/mock/repo/contents/src/components",
      html_url: "https://github.com/mock/repo/tree/main/src/components",
      git_url: "https://api.github.com/repos/mock/repo/git/trees/mno345",
      download_url: null,
      type: "dir",
      _links: {
        self: "https://api.github.com/repos/mock/repo/contents/src/components",
        git: "https://api.github.com/repos/mock/repo/git/trees/mno345",
        html: "https://github.com/mock/repo/tree/main/src/components"
      }
    },
    {
      name: "utils",
      path: "src/utils",
      sha: "pqr678",
      size: 0,
      url: "https://api.github.com/repos/mock/repo/contents/src/utils",
      html_url: "https://github.com/mock/repo/tree/main/src/utils",
      git_url: "https://api.github.com/repos/mock/repo/git/trees/pqr678",
      download_url: null,
      type: "dir",
      _links: {
        self: "https://api.github.com/repos/mock/repo/contents/src/utils",
        git: "https://api.github.com/repos/mock/repo/git/trees/pqr678",
        html: "https://github.com/mock/repo/tree/main/src/utils"
      }
    }
  ],
  "src/components": [
    {
      name: "Button.tsx",
      path: "src/components/Button.tsx",
      sha: "jkl012",
      size: 256,
      url: "https://api.github.com/repos/mock/repo/contents/src/components/Button.tsx",
      html_url: "https://github.com/mock/repo/blob/main/src/components/Button.tsx",
      git_url: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
      download_url: "https://raw.githubusercontent.com/mock/repo/main/src/components/Button.tsx",
      type: "file",
      _links: {
        self: "https://api.github.com/repos/mock/repo/contents/src/components/Button.tsx",
        git: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
        html: "https://github.com/mock/repo/blob/main/src/components/Button.tsx"
      }
    }
  ]
};
```

### 3. MockGitHubClient.ts
```typescript
import { Result, err, ok } from "neverthrow";
import type { HttpError } from "../errors";
import { createGitHubError } from "../errors";
import type { IGitHubClient, GitHubFile, GitHubDirectoryItem } from "./IGitHubClient";
import { mockFileContents, mockDirectoryContents } from "./mockData";
import { decodeBase64Content } from "../github";

export class MockGitHubClient implements IGitHubClient {
  async fetchContent(
    owner: string,
    repo: string,
    path = "",
    ref?: string
  ): Promise<Result<GitHubFile | GitHubDirectoryItem[], HttpError>> {
    if (!owner || !repo) {
      return err(createGitHubError("Repository owner and name are required."));
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    if (mockFileContents[path]) {
      return ok(mockFileContents[path]);
    }

    if (mockDirectoryContents[path]) {
      return ok(mockDirectoryContents[path]);
    }

    return err(createGitHubError(`GitHub API error: 404 Not Found - ${path} (Not Found)`, 404));
  }

  decodeBase64Content(base64String: string): Result<string, HttpError> {
    return decodeBase64Content(base64String);
  }
}
```

### 4. GitHubClient.ts (既存GitHubClientの移動)
```typescript
import { Result, err, ok } from "neverthrow";
import type { HttpError } from "../errors";
import { createGitHubError } from "../errors";
import { HttpClient } from "../httpClient";
import type { IGitHubClient, GitHubFile, GitHubDirectoryItem } from "./IGitHubClient";
import { decodeBase64Content } from "../github";

export class GitHubClient implements IGitHubClient {
  private httpClient: HttpClient;

  constructor(token?: string) {
    const headers = {
      Accept: "application/vnd.github.v3+json",
      ...(token && { Authorization: `token ${token}` }),
    };
    this.httpClient = new HttpClient("https://api.github.com", headers);
  }

  async fetchContent(
    owner: string,
    repo: string,
    path = "",
    ref?: string
  ): Promise<Result<GitHubFile | GitHubDirectoryItem[], HttpError>> {
    // 既存のGitHubClient.fetchContentの実装をそのまま移動
    if (!owner || !repo) {
      return err(createGitHubError("Repository owner and name are required."));
    }

    let endpoint = `/repos/${owner}/${repo}/contents/${path}`;
    if (ref) {
      endpoint += `?ref=${encodeURIComponent(ref)}`;
    }

    const result = await this.httpClient.get<
      GitHubFile | GitHubDirectoryItem[]
    >(endpoint);

    return result.mapErr((error) => {
      if (error.type === "NETWORK_ERROR") {
        return error;
      }

      if (error.status) {
        const httpErrorMatch = error.message.match(/^HTTP (\d+): (.+)$/);
        const statusText = httpErrorMatch ? httpErrorMatch[2] : error.message;

        if (error.status === 404) {
          const errorMessage = `GitHub API error: 404 Not Found - ${statusText} (Not Found)`;
          return createGitHubError(errorMessage, error.status);
        }

        if (error.status === 403) {
          const isRateLimit =
            error.details &&
            typeof error.details === "object" &&
            "message" in error.details &&
            typeof error.details.message === "string" &&
            error.details.message.includes("rate limit exceeded");

          if (isRateLimit) {
            const details = error.details as { message: string };
            const errorMessage = `GitHub API error: 403 Forbidden - ${details.message} (Rate limit exceeded)`;
            return createGitHubError(errorMessage, error.status);
          }

          const errorMessage = `GitHub API error: 403 ${statusText}`;
          return createGitHubError(errorMessage, error.status);
        }

        if (error.status === 500) {
          const errorMessage = `GitHub API error: 500 Internal Server Error - ${statusText}`;
          return createGitHubError(errorMessage, error.status);
        }

        const errorMessage = `GitHub API error: ${error.status} ${statusText}`;
        return createGitHubError(errorMessage, error.status);
      }

      const errorMessage = `GitHub API error: ${error.message}`;
      return createGitHubError(errorMessage, error.status);
    });
  }

  decodeBase64Content(base64String: string): Result<string, HttpError> {
    return decodeBase64Content(base64String);
  }
}
```

### 5. factory.ts
```typescript
import type { IGitHubClient } from "./IGitHubClient";
import { GitHubClient } from "./GitHubClient";
import { MockGitHubClient } from "./MockGitHubClient";

export function createGitHubClient(token?: string): IGitHubClient {
  const useMock = import.meta.env.VITE_USE_MOCK_GITHUB_CLIENT === "true";

  if (useMock) {
    return new MockGitHubClient();
  }

  return new GitHubClient(token);
}
```

### 6. github/index.ts
```typescript
export type { IGitHubClient, GitHubFile, GitHubDirectoryItem } from "./IGitHubClient";
export { GitHubClient } from "./GitHubClient";
export { MockGitHubClient } from "./MockGitHubClient";
export { createGitHubClient } from "./factory";
```

### 7. api.ts (更新)
```typescript
import { ChatApiClient } from "./chatApiClient";
import { createGitHubClient } from "./github";

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:3001/api";

export const chatApiClient = new ChatApiClient(API_BASE_URL);
export const gitHubClient = createGitHubClient();
```

### 8. github.ts (後方互換性のため)
```typescript
export type { GitHubFile, GitHubDirectoryItem } from "./github/IGitHubClient";
export { createGitHubClient as GitHubClient } from "./github/factory";
export { decodeBase64Content } from "./github/GitHubClient";
```

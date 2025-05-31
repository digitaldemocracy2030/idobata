# MCP neverthrow導入手順書

## 1. 概要
MCPプロジェクトにneverthrowライブラリを導入し、既存のtry-catchパターンをneverthrowのResult型に変換する手順書です。
backendと同じneverthrow@^8.2.0を使用します。

## 2. 現状分析

### 2.1 MCPプロジェクト構造
```
mcp/
├── src/
│   ├── main.ts
│   ├── server.ts
│   ├── config.ts
│   ├── logger.ts
│   ├── handlers/
│   │   ├── updatePr.ts
│   │   └── upsertFile.ts
│   ├── github/
│   │   ├── client.ts
│   │   └── utils.ts
│   └── utils/
│       └── stringUtils.ts
└── package.json
```

### 2.2 現在のtry-catchパターン
以下のファイルでtry-catchが使用されています：
- `mcp/src/main.ts` - 2箇所
- `mcp/src/handlers/updatePr.ts` - 1箇所
- `mcp/src/handlers/upsertFile.ts` - 3箇所
- `mcp/src/github/client.ts` - 2箇所
- `mcp/src/github/utils.ts` - 4箇所

## 3. 導入手順

### 3.1 neverthrowの依存関係追加

```bash
cd mcp
npm install neverthrow@^8.2.0
```

### 3.2 エラー型定義の作成

`mcp/src/types/errors.ts`を作成：

```typescript
export class GitHubApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export class FileSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileSystemError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class McpServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "McpServerError";
  }
}
```

### 3.3 ファイル別変換手順

#### 3.3.1 mcp/src/main.ts

**変更前のパターン:**
```typescript
try {
  // サーバーをトランスポートに接続
  await server.connect(transport);
  logger.info("Server connected via Stdio. Waiting for requests...");
} catch (error) {
  logger.error({ error }, "Failed to connect server");
  process.exit(1);
}
```

**変更後のパターン:**
```typescript
import { Result, ok, err } from "neverthrow";
import { McpServerError } from "./types/errors.js";

const connectServer = async (): Promise<Result<void, McpServerError>> => {
  try {
    await server.connect(transport);
    logger.info("Server connected via Stdio. Waiting for requests...");
    return ok(undefined);
  } catch (error) {
    return err(new McpServerError(`Failed to connect server: ${error instanceof Error ? error.message : "Unknown error"}`));
  }
};

// 使用箇所
const connectResult = await connectServer();
if (connectResult.isErr()) {
  logger.error({ error: connectResult.error }, "Failed to connect server");
  process.exit(1);
}
```

#### 3.3.2 mcp/src/github/client.ts

**変更前のパターン:**
```typescript
try {
  logger.info(`Reading private key from file: ${keyPath}`);
  return fs.readFileSync(keyPath, "utf8");
} catch (error) {
  logger.error(
    { error, keyPath },
    "Failed to read GitHub private key from file"
  );
  throw new Error(`Failed to read private key: ${error}`);
}
```

**変更後のパターン:**
```typescript
import { Result, ok, err } from "neverthrow";
import { FileSystemError } from "../types/errors.js";

const readPrivateKey = (keyPath: string): Result<string, FileSystemError> => {
  try {
    logger.info(`Reading private key from file: ${keyPath}`);
    const privateKey = fs.readFileSync(keyPath, "utf8");
    return ok(privateKey);
  } catch (error) {
    logger.error(
      { error, keyPath },
      "Failed to read GitHub private key from file"
    );
    return err(new FileSystemError(`Failed to read private key: ${error instanceof Error ? error.message : "Unknown error"}`));
  }
};
```

#### 3.3.3 mcp/src/handlers/updatePr.ts

**変更前のパターン:**
```typescript
try {
  const octokit = await getAuthenticatedOctokit();
  // ... 処理 ...
  return {
    content: [
      {
        type: "text",
        text: `Successfully updated PR #${prNumber}: ${result.html_url}`,
      },
    ],
  };
} catch (error: unknown) {
  logger.error(
    { error, owner, repo, prNumber, title, body },
    "Failed to update PR"
  );
  return {
    content: [
      {
        type: "text",
        text: `Failed to update PR: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
    ],
    isError: true,
  };
}
```

**変更後のパターン:**
```typescript
import { Result, ok, err } from "neverthrow";
import { GitHubApiError } from "../types/errors.js";

const updatePrInternal = async (
  owner: string,
  repo: string,
  prNumber: number,
  title?: string,
  body?: string
): Promise<Result<{ html_url: string }, GitHubApiError>> => {
  try {
    const octokit = await getAuthenticatedOctokit();
    // ... 処理 ...
    return ok({ html_url: result.html_url });
  } catch (error: unknown) {
    logger.error(
      { error, owner, repo, prNumber, title, body },
      "Failed to update PR"
    );
    return err(new GitHubApiError(`Failed to update PR: ${error instanceof Error ? error.message : "Unknown error"}`));
  }
};

// ハンドラー内での使用
const result = await updatePrInternal(owner, repo, prNumber, title, body);
if (result.isErr()) {
  return {
    content: [
      {
        type: "text",
        text: `Failed to update PR: ${result.error.message}`,
      },
    ],
    isError: true,
  };
}

return {
  content: [
    {
      type: "text",
      text: `Successfully updated PR #${prNumber}: ${result.value.html_url}`,
    },
  ],
};
```

#### 3.3.4 mcp/src/handlers/upsertFile.ts

**変更前のパターン:**
```typescript
try {
  const { data: contentData } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: filePath,
    ref: branchName,
  });
  // ... 処理 ...
} catch (error: unknown) {
  if (error instanceof Error && "status" in error && error.status === 404) {
    logger.info(`File ${filePath} does not exist, will create new file`);
  } else {
    throw error;
  }
}
```

**変更後のパターン:**
```typescript
import { Result, ok, err } from "neverthrow";
import { GitHubApiError } from "../types/errors.js";

const getFileContent = async (
  octokit: any,
  owner: string,
  repo: string,
  filePath: string,
  branchName: string
): Promise<Result<{ sha: string; content: string } | null, GitHubApiError>> => {
  try {
    const { data: contentData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branchName,
    });
    // ... 処理 ...
    return ok({ sha: contentData.sha, content: decodedContent });
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error && error.status === 404) {
      logger.info(`File ${filePath} does not exist, will create new file`);
      return ok(null);
    }
    return err(new GitHubApiError(`Failed to get file content: ${error instanceof Error ? error.message : "Unknown error"}`));
  }
};
```

#### 3.3.5 mcp/src/github/utils.ts

**変更前のパターン:**
```typescript
try {
  await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branchName}`,
  });
  branchExists = true;
  logger.info(`Branch ${branchName} already exists.`);
} catch (error: unknown) {
  if (error instanceof Error && "status" in error && error.status === 404) {
    logger.info(`Branch ${branchName} does not exist, will create it.`);
  } else {
    throw error;
  }
}
```

**変更後のパターン:**
```typescript
import { Result, ok, err } from "neverthrow";
import { GitHubApiError } from "../types/errors.js";

const checkBranchExists = async (
  octokit: any,
  owner: string,
  repo: string,
  branchName: string
): Promise<Result<boolean, GitHubApiError>> => {
  try {
    await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branchName}`,
    });
    logger.info(`Branch ${branchName} already exists.`);
    return ok(true);
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error && error.status === 404) {
      logger.info(`Branch ${branchName} does not exist, will create it.`);
      return ok(false);
    }
    return err(new GitHubApiError(`Failed to check branch existence: ${error instanceof Error ? error.message : "Unknown error"}`));
  }
};
```

## 4. 変換パターンの統一

### 4.1 基本的な変換パターン

**Before:**
```typescript
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  logger.error("Operation failed", error);
  throw new Error(`Operation failed: ${error.message}`);
}
```

**After:**
```typescript
import { Result, ok, err } from "neverthrow";

const someOperation = async (): Promise<Result<ReturnType, ErrorType>> => {
  try {
    const result = await someAsyncOperation();
    return ok(result);
  } catch (error) {
    logger.error("Operation failed", error);
    return err(new ErrorType(`Operation failed: ${error instanceof Error ? error.message : "Unknown error"}`));
  }
};
```

### 4.2 エラーハンドリングパターン

**Before:**
```typescript
try {
  // 処理
} catch (error) {
  if (error.status === 404) {
    // 404の場合の処理
  } else {
    throw error;
  }
}
```

**After:**
```typescript
const operation = async (): Promise<Result<T, ErrorType>> => {
  try {
    // 処理
    return ok(result);
  } catch (error) {
    if (error instanceof Error && "status" in error && error.status === 404) {
      // 404の場合の処理
      return ok(defaultValue);
    }
    return err(new ErrorType(`Operation failed: ${error instanceof Error ? error.message : "Unknown error"}`));
  }
};
```

## 5. 実装順序

1. **依存関係の追加**
   ```bash
   cd mcp
   npm install neverthrow@^8.2.0
   ```

2. **エラー型定義の作成**
   - `mcp/src/types/errors.ts`を作成

3. **ファイル別の変換（推奨順序）**
   1. `mcp/src/github/client.ts` - 基本的なファイル操作
   2. `mcp/src/github/utils.ts` - GitHub API操作
   3. `mcp/src/handlers/upsertFile.ts` - ファイル操作ハンドラー
   4. `mcp/src/handlers/updatePr.ts` - PR操作ハンドラー
   5. `mcp/src/main.ts` - メインエントリーポイント

4. **テスト実行**
   ```bash
   npm run build
   npm run typecheck
   ```

## 6. 注意点

### 6.1 型安全性の確保
- 全ての非同期操作をResult型でラップする
- エラーの型を明確に定義する
- `unknown`型のエラーを適切にハンドリングする

### 6.2 既存の動作を維持
- ログ出力の形式を変更しない
- エラーメッセージの内容を可能な限り維持する
- 404エラーなどの特別なケースの処理を維持する

### 6.3 段階的な導入
- 一度に全てのファイルを変更せず、ファイル単位で段階的に導入する
- 各ファイルの変更後にビルドとテストを実行する
- 既存の機能に影響がないことを確認する

## 7. メリット

### 7.1 型安全性の向上
- コンパイル時にエラーハンドリングの漏れを検出
- Result型による明示的なエラーハンドリング

### 7.2 保守性の向上
- エラーの種類が型で明確に定義される
- 一貫したエラーハンドリングパターン

### 7.3 可読性の向上
- エラーハンドリングのフローが明確
- 早期リターンパターンによる可読性向上

## 8. 完了後の確認項目

- [ ] 全てのtry-catchがResult型に変換されている
- [ ] ビルドエラーが発生しない
- [ ] 型チェックが通る
- [ ] 既存の機能が正常に動作する
- [ ] ログ出力が適切に行われる
- [ ] エラーメッセージが適切に表示される

# ユーザーチャットからPR作成までの詳細フロー

このドキュメントでは、policy-editシステムにおいて、ユーザーがチャットを行ってから、PRが作成されるまでの詳細なフローを説明します。

## システム概要

policy-editシステムは、ユーザーが政策文書に対する改善提案をチャットインターフェースを通じて行い、その提案が自動的にGitHub PRとして作成される仕組みを提供しています。

## コンポーネント構成

```mermaid
graph TD
    subgraph "フロントエンド"
        A[ChatPanel.tsx] --> B[contentStore.ts]
        A --> C[API通信]
    end

    subgraph "バックエンド"
        D[chat.ts ルート] --> E[McpClient]
        E --> F[MCP Server]
    end

    subgraph "MCP Server"
        F --> G[GitHub API]
        F --> H[upsertFile.ts]
        F --> I[updatePr.ts]
    end

    subgraph "GitHub"
        G --> J[リポジトリ]
        J --> K[ブランチ]
        K --> L[ファイル]
        K --> M[PR]
    end

    C --> D
```

## 詳細フロー

以下は、ユーザーがチャットを行ってからPRが作成されるまでの詳細なフローチャートです。

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant Frontend as フロントエンド<br>(ChatPanel.tsx)
    participant Store as Zustandストア<br>(contentStore.ts)
    participant Backend as バックエンド<br>(chat.ts)
    participant MCP as MCPクライアント<br>(client.ts)
    participant MCPServer as MCPサーバー<br>(main.ts)
    participant UpsertFile as ファイル更新ハンドラ<br>(upsertFile.ts)
    participant UpdatePR as PR更新ハンドラ<br>(updatePr.ts)
    participant GitHub as GitHub API<br>(client.ts)

    User->>Frontend: 1. MDファイルを選択
    Frontend->>Store: 2. ファイル情報を保存
    Store-->>Frontend: 3. ファイル内容を表示

    User->>Frontend: 4. チャットメッセージを入力
    Frontend->>Store: 5. メッセージをスレッドに追加
    Frontend->>Backend: 6. メッセージをAPIに送信
    Note over Frontend,Backend: message, history, branchId, fileContent, userName, filePath

    Backend->>MCP: 7. processQuery呼び出し
    MCP->>MCPServer: 8. ツール呼び出し

    alt 初回メッセージ（ブランチ作成）
        MCPServer->>GitHub: 9a. ブランチ存在確認
        GitHub-->>MCPServer: 10a. ブランチ未存在
        MCPServer->>GitHub: 11a. ベースブランチの最新コミットSHA取得
        GitHub-->>MCPServer: 12a. ベースブランチSHA
        MCPServer->>GitHub: 13a. 新規ブランチ作成
        GitHub-->>MCPServer: 14a. ブランチ作成完了
    end

    alt ファイル更新
        MCPServer->>UpsertFile: 15. upsertFile呼び出し
        UpsertFile->>GitHub: 16. ファイル存在確認
        GitHub-->>UpsertFile: 17. ファイル情報（存在する場合はSHA）
        UpsertFile->>GitHub: 18. ファイル作成/更新
        GitHub-->>UpsertFile: 19. コミット結果
        UpsertFile-->>MCPServer: 20. ファイル更新結果
    end

    alt PR作成/更新
        MCPServer->>UpdatePR: 21. updatePr呼び出し
        UpdatePR->>GitHub: 22. PR存在確認

        alt PRが存在しない場合
            GitHub-->>UpdatePR: 23a. PR未存在
            UpdatePR->>GitHub: 24a. Draft PR作成
            GitHub-->>UpdatePR: 25a. 新規PR情報
        else PRが既に存在する場合
            GitHub-->>UpdatePR: 23b. 既存PR情報
        end

        UpdatePR->>GitHub: 26. PRタイトル・説明更新
        GitHub-->>UpdatePR: 27. 更新結果
        UpdatePR-->>MCPServer: 28. PR更新結果
    end

    MCPServer-->>MCP: 29. 処理結果
    MCP-->>Backend: 30. レスポンス
    Backend-->>Frontend: 31. APIレスポンス
    Frontend->>Store: 32. ボットメッセージをスレッドに追加
    Store-->>Frontend: 33. 更新されたスレッドを表示
    Frontend->>User: 34. PRリンクを表示
```

## クラスとファイルの詳細フロー

以下は、各処理ステップにおける具体的なクラスとメソッドの呼び出しフローです。

```mermaid
flowchart TD
    subgraph "フロントエンド処理"
        A[ChatPanel.tsx] -->|handleSendMessage| B["fetch('/api/chat')"]
        B --> C["contentStore.addMessageToThread()"]
        C --> D["contentStore.reloadCurrentContent()"]
    end

    subgraph "バックエンドAPI処理"
        E["chat.ts: router.post('/')"] -->|req.body処理| F["McpClient.processQuery()"]
        F -->|OpenAI API呼び出し| G["openai.chat.completions.create()"]
        G -->|ツール呼び出し検出| H["mcp.callTool()"]
    end

    subgraph "MCPサーバー処理"
        I["main.ts: handleToolCall()"] -->|ツール名に基づく振り分け| J{"ツール種別判定"}
        J -->|"upsert_file"| K["handleUpsertFile()"]
        J -->|"update_pr"| L["handleUpdatePr()"]

        K -->|ファイル処理| M["getAuthenticatedOctokit()"]
        K -->|ブランチ確認| N["ensureBranchExists()"]
        K -->|ファイル取得| O["octokit.rest.repos.getContent()"]
        K -->|ファイル更新| P["octokit.rest.repos.createOrUpdateFileContents()"]

        L -->|PR処理| Q["getAuthenticatedOctokit()"]
        L -->|PR検索/作成| R["findOrCreateDraftPr()"]
        L -->|PR更新| S["octokit.rest.pulls.update()"]

        R -->|PR検索| T["octokit.rest.pulls.list()"]
        R -->|PR作成| U["octokit.rest.pulls.create()"]
    end

    subgraph "GitHub API処理"
        V["getAuthenticatedOctokit()"] -->|認証| W["App.getInstallationOctokit()"]
        N -->|参照取得| X["octokit.rest.git.getRef()"]
        N -->|参照作成| Y["octokit.rest.git.createRef()"]
    end

    F --> I
    M --> V
    Q --> V
```

## 処理の詳細説明

1. **ユーザーインタラクション**
   - ユーザーはフロントエンドのChatPanelコンポーネントでMDファイルを選択し、チャットメッセージを入力します
   - 入力されたメッセージはZustandストア（contentStore.ts）に保存され、APIに送信されます

2. **バックエンド処理**
   - chat.tsのルートハンドラがリクエストを受け取り、McpClientのprocessQueryメソッドを呼び出します
   - processQueryメソッドはOpenAI APIを使用してメッセージを処理し、必要に応じてMCPツールを呼び出します

3. **MCPサーバー処理**
   - MCPサーバーはツール呼び出しを受け取り、適切なハンドラ（upsertFile.tsまたはupdatePr.ts）に振り分けます
   - ハンドラはGitHub APIを使用して、ブランチ、ファイル、PRの作成/更新を行います

4. **GitHub操作**
   - GitHub APIを通じて、ブランチの作成、ファイルの更新、PRの作成/更新が行われます
   - 各操作の結果はMCPサーバーからバックエンド、そしてフロントエンドに返されます

5. **結果表示**
   - 処理結果はフロントエンドに返され、ユーザーにPRリンクが表示されます

## 主要なクラスと役割

| コンポーネント | ファイル | 主な役割 |
|--------------|---------|---------|
| ChatPanel | frontend/src/components/ChatPanel.tsx | ユーザーインターフェース、チャット入力処理 |
| contentStore | frontend/src/store/contentStore.ts | チャットスレッド、ファイル内容の状態管理 |
| chat routes | backend/src/routes/chat.ts | APIエンドポイント、リクエスト処理 |
| McpClient | backend/src/mcp/client.ts | MCPサーバーとの通信、クエリ処理 |
| upsertFile | mcp/src/handlers/upsertFile.ts | ファイル作成/更新処理 |
| updatePr | mcp/src/handlers/updatePr.ts | PR作成/更新処理 |
| GitHub utils | mcp/src/github/utils.ts | ブランチ、PR作成のユーティリティ関数 |
| GitHub client | mcp/src/github/client.ts | GitHub API認証、Octokit初期化 |

## 処理フローの特徴

1. **非同期処理チェーン**
   - フロントエンドからバックエンド、MCPサーバー、GitHub APIまで、一連の非同期処理として実行されます

2. **状態管理**
   - フロントエンドではZustandストアを使用して、チャットスレッドやファイル内容の状態を管理しています

3. **エラーハンドリング**
   - 各レイヤーでエラーハンドリングが実装されており、エラーメッセージがユーザーに表示されます

4. **認証フロー**
   - GitHub APIへのアクセスはGitHub Appの認証を使用しており、インストールトークンを取得して操作を行います

5. **インテリジェントファイルルーティング**
   - ユーザーの提案内容に基づいて、最適なファイルを自動選択する機能が実装されています

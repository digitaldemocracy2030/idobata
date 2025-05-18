# ファクトチェック機能実装ガイド

## 概要

この機能は、GitHub Pull Requestに対してファクトチェックを実行し、結果をPRにコメントとして投稿します。具体的には、PRに「/fc」というコメントが投稿されると、そのPRの変更内容（日本語の政策に対する差分）に対してファクトチェックを実行し、結果をシステムからのコメントとして投稿します。

## 機能要件

1. GitHub Actionsからのリクエストを受け付けるエンドポイントを提供
2. PRコメントの「/fc」をトリガーとしてファクトチェックを実行
3. OpenAI GPT-4oとインターネットアクセスを使用したファクトチェック
4. GitHub secretsによる認証
5. 明確なエラーハンドリングとGitHubへのエラー通知

## 実装手順

### 1. 必要なパッケージのインストール

```bash
npm install @octokit/rest @octokit/webhooks
```

### 2. 設定ファイルの更新

`src/config.ts`ファイルに以下の環境変数を追加します：

```typescript
// ファクトチェック機能の設定
export const FACTCHECK_AUTH_TOKEN = process.env.FACTCHECK_AUTH_TOKEN;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 必須環境変数の検証に追加
if (!FACTCHECK_AUTH_TOKEN) {
  console.warn(
    "FACTCHECK_AUTH_TOKEN is not set. The factcheck feature will not function properly."
  );
}
if (!OPENAI_API_KEY) {
  console.warn(
    "OPENAI_API_KEY is not set. The factcheck feature will not function properly."
  );
}
```

### 3. ファクトチェックエンドポイントを作成

`src/routes/factcheck.ts`ファイルを作成し、以下のコードを実装します：

```typescript
import express from "express";
import { Octokit } from "@octokit/rest";
import OpenAI from "openai";
import { FACTCHECK_AUTH_TOKEN, OPENAI_API_KEY } from "../config.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// OctokitとOpenAIのインスタンスを初期化
const octokit = new Octokit();
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// PRリンクを検証する関数
function validatePrLink(prLink: string): { owner: string; repo: string; pull_number: number } | null {
  try {
    const url = new URL(prLink);
    if (url.hostname !== "github.com") return null;
    
    const pathParts = url.pathname.split("/");
    if (pathParts.length < 5 || pathParts[3] !== "pull") return null;
    
    return {
      owner: pathParts[1],
      repo: pathParts[2],
      pull_number: parseInt(pathParts[4], 10)
    };
  } catch (error) {
    return null;
  }
}

// ファクトチェックを実行する関数
async function performFactCheck(prContent: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたはファクトチェックの専門家です。提供されるPull Requestの内容に含まれる事実を検証し、誤りや不正確な情報を指摘してください。検証にはインターネットの情報を活用してください。結果は日本語でマークダウン形式で返してください。"
        },
        {
          role: "user",
          content: `以下のPull Request内容をファクトチェックしてください：\n\n${prContent}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      tools: [{
        type: "retrieval",
        retrieval: {}
      }],
      tool_choice: {
        type: "tool",
        tool: {
          type: "retrieval"
        }
      }
    });
    
    return response.choices[0].message.content || "ファクトチェック結果を生成できませんでした。";
  } catch (error) {
    logger.error("Error during factcheck LLM call:", error);
    throw new Error("ファクトチェックの実行中にエラーが発生しました。");
  }
}

// PRの内容を取得する関数
async function getPrContent(owner: string, repo: string, pull_number: number): Promise<string> {
  try {
    // PRの詳細を取得
    const { data: pullRequest } = await octokit.pulls.get({
      owner,
      repo,
      pull_number,
    });
    
    // PRの変更内容（差分）を取得
    const { data: files } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number,
    });
    
    // PRの情報をテキストにまとめる
    let content = `# ${pullRequest.title}\n\n`;
    content += `${pullRequest.body || "説明なし"}\n\n`;
    content += "## 変更内容\n\n";
    
    for (const file of files) {
      content += `### ${file.filename}\n`;
      content += `変更: ${file.status}\n`;
      if (file.patch) {
        content += "```diff\n" + file.patch + "\n```\n\n";
      }
    }
    
    return content;
  } catch (error) {
    logger.error("Error fetching PR content:", error);
    throw new Error("PRの内容を取得できませんでした。");
  }
}

// PRにコメントを投稿する関数
async function postCommentToPr(owner: string, repo: string, pull_number: number, comment: string): Promise<void> {
  try {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: comment
    });
  } catch (error) {
    logger.error("Error posting comment to PR:", error);
    throw new Error("PRへのコメント投稿に失敗しました。");
  }
}

// ファクトチェックエンドポイント
router.post("/", async (req, res) => {
  try {
    // 認証トークンのチェック
    const authToken = req.headers.authorization?.split(" ")[1];
    if (authToken !== FACTCHECK_AUTH_TOKEN) {
      logger.warn("Unauthorized factcheck request attempt");
      return res.status(401).json({ error: "認証に失敗しました。有効な認証トークンが必要です。" });
    }
    
    // リクエストパラメータのバリデーション
    const { prLink } = req.body;
    
    if (!prLink || typeof prLink !== "string") {
      return res.status(400).json({ error: "有効なPRリンクが必要です。" });
    }
    
    // PRリンクの検証
    const prDetails = validatePrLink(prLink);
    if (!prDetails) {
      return res.status(400).json({ error: "無効なPRリンク形式です。正しいGitHub PRリンクを指定してください。" });
    }
    
    // PRの内容を取得
    const prContent = await getPrContent(prDetails.owner, prDetails.repo, prDetails.pull_number);
    
    // ファクトチェックを実行
    const factcheckResult = await performFactCheck(prContent);
    
    // 結果をPRにコメントとして投稿
    const comment = `# ファクトチェック結果\n\n${factcheckResult}\n\n_このコメントはファクトチェック自動化システムによって生成されました_`;
    await postCommentToPr(prDetails.owner, prDetails.repo, prDetails.pull_number, comment);
    
    return res.json({
      success: true,
      message: "ファクトチェックが完了し、結果がPRにコメントとして投稿されました。"
    });
  } catch (error) {
    logger.error("Error in factcheck endpoint:", error);
    
    // エラーメッセージを抽出
    const errorMessage = error instanceof Error ? error.message : "不明なエラーが発生しました。";
    
    // PRリンクが有効で、エラー発生時にもGitHubにエラーを通知する
    try {
      const { prLink } = req.body;
      const prDetails = validatePrLink(prLink);
      
      if (prDetails) {
        const errorComment = `# ファクトチェックエラー\n\n処理中にエラーが発生しました：\n\n\`\`\`\n${errorMessage}\n\`\`\`\n\n詳細はサーバーログを確認してください。`;
        await postCommentToPr(prDetails.owner, prDetails.repo, prDetails.pull_number, errorComment);
      }
    } catch (commentError) {
      logger.error("Failed to post error comment to PR:", commentError);
    }
    
    return res.status(500).json({
      error: "ファクトチェック処理中にエラーが発生しました。",
      details: errorMessage
    });
  }
});

export default router;
```

### 4. GitHub Actionsからのリクエストを処理するためのスクリプト例を提供

GitHub Actionsのワークフロー例（`.github/workflows/factcheck.yml`）:

```yaml
name: Factcheck on PR Comment

on:
  issue_comment:
    types: [created]

jobs:
  factcheck:
    runs-on: ubuntu-latest
    if: ${{ github.event.issue.pull_request && contains(github.event.comment.body, '/fc') }}
    steps:
      - name: Get PR information
        id: pr-info
        run: |
          PR_URL="${{ github.event.issue.pull_request.url }}"
          PR_HTML_URL="${PR_URL/api.github.com\/repos/github.com}"
          echo "PR_HTML_URL=$PR_HTML_URL" >> $GITHUB_ENV
      
      - name: Run Factcheck
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.FACTCHECK_AUTH_TOKEN }}" \
            -d '{"prLink": "'"$PR_HTML_URL"'"}' \
            https://your-backend-url.com/factcheck
        env:
          FACTCHECK_AUTH_TOKEN: ${{ secrets.FACTCHECK_AUTH_TOKEN }}
```

### 5. メインアプリケーションにルーターを登録

`src/index.ts`ファイルに以下のコードを追加します：

```typescript
import factcheckRoutes from "./routes/factcheck.js";

// ...

// Routes
app.use("/chat", chatRoutes);
app.use("/factcheck", factcheckRoutes); // 新しいルーターを追加
```

### 6. 環境変数の設定

`.env.template`ファイルに以下の環境変数を追加します：

```
# Factcheck Feature
FACTCHECK_AUTH_TOKEN=your_secret_token
OPENAI_API_KEY=your_openai_api_key
```

## 詳細

### 認証の仕組み

- GitHub Actionsのワークフローで使用するトークンは、GitHub Secretsとして設定します
- このトークンは環境変数`FACTCHECK_AUTH_TOKEN`として設定され、APIリクエストのAuthorizationヘッダーで使用します
- サーバー側でリクエストのAuthorizationヘッダーとサーバーの環境変数を比較して認証を行います

### エラーハンドリング

- リクエストパラメータが不正な場合は400エラーを返します
- 認証が失敗した場合は401エラーを返します
- サーバー側のエラーは500エラーとして返し、詳細なエラーメッセージを含めます
- エラーが発生してもPRが特定できる場合は、PRにエラーメッセージをコメントとして投稿します

### ファクトチェックの流れ

1. PR中に「/fc」コメントが投稿される
2. GitHub Actionsがそれを検知し、PRのURLをバックエンドに送信
3. バックエンドはPRの内容を取得
4. OpenAI GPT-4oにファクトチェックを依頼（インターネットアクセス有効）
5. 結果をPRにコメントとして投稿

# GitHub PR 自動ラベル付け機能の実装計画

## 概要

このドキュメントでは、ユーザーとチャットして GitHub PR を自動的に作成するアプリケーションに、PR に適切なラベルを自動的に付与する機能を実装する手順について説明します。ラベルの選定には LLM（大規模言語モデル）を活用し、処理のたびに GitHub から最新のラベルリストを取得します。

## 実装目標

1. PR 作成・更新時に、その内容に基づいて適切なラベルを自動的に付与する
2. 処理のたびに GitHub から最新のラベルリストを取得する
3. LLM を活用して PR の内容を分析し、適切なラベルを選択する

## 実装手順

### 1. 新規ファイルの作成

`policy-edit/mcp/src/github/labels.ts` ファイルを作成し、以下の機能を実装します：

- GitHub リポジトリからラベルリストを取得する機能
- LLM を使用して PR の内容を分析し、適切なラベルを選択する機能
- 選択したラベルを PR に適用する機能

```typescript
import type { Octokit } from "@octokit/rest";
import OpenAI from "openai";
import config from "../config.js";
import logger from "../logger.js";
import { OPENROUTER_API_KEY } from "../config.js";

// OpenAIクライアントの初期化
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
});

// ラベルの型定義
export interface GitHubLabel {
  id: number;
  node_id: string;
  url: string;
  name: string;
  description: string | null;
  color: string;
  default: boolean;
}

/**
 * リポジトリの全ラベルを取得する
 * @param octokit 認証済みOctokitインスタンス
 * @returns ラベルの配列
 */
export async function fetchRepoLabels(
  octokit: Octokit
): Promise<GitHubLabel[]> {
  const owner = config.GITHUB_TARGET_OWNER;
  const repo = config.GITHUB_TARGET_REPO;

  logger.info(`Fetching labels for ${owner}/${repo}`);

  try {
    const { data: labels } = await octokit.rest.issues.listLabelsForRepo({
      owner,
      repo,
      per_page: 100, // 一度に取得するラベル数（最大100）
    });

    logger.info(`Fetched ${labels.length} labels from repository`);
    return labels;
  } catch (error) {
    logger.error({ error }, "Failed to fetch repository labels");
    throw error;
  }
}

/**
 * LLMを使用してPRの内容に基づいて適切なラベルを選択する
 * @param prTitle PRのタイトル
 * @param prBody PRの説明文
 * @param labels 利用可能なラベルのリスト
 * @returns 適用すべきラベル名の配列
 */
export async function selectLabelsWithLLM(
  prTitle: string,
  prBody: string,
  labels: GitHubLabel[]
): Promise<string[]> {
  // 利用可能なラベルの情報を整形
  const availableLabels = labels.map((label) => ({
    name: label.name,
    description: label.description || `Label: ${label.name}`,
  }));

  // LLMへのプロンプト作成
  const prompt = `
あなたはGitHubプルリクエスト（PR）に適切なラベルを付ける専門家です。
以下のPRの内容を分析し、最も適切なラベルを選択してください。

## PR情報
タイトル: ${prTitle}
説明: ${prBody}

## 利用可能なラベル
${JSON.stringify(availableLabels, null, 2)}

## 指示
1. PRの内容を分析してください
2. 利用可能なラベルの中から、このPRに最も適切なラベルを選択してください
3. 選択したラベル名のみを配列形式で返してください（例: ["bug", "documentation"]）
4. 適切なラベルがない場合は空の配列を返してください
5. 回答は必ずJSON形式の配列のみを返してください

## 回答形式
["label1", "label2", ...]
`;

  try {
    logger.info("Requesting LLM to select labels for PR");

    // LLMにリクエスト
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.5-pro-preview-03-25", // 使用するモデル
      messages: [
        {
          role: "system",
          content:
            "あなたはGitHubプルリクエストに適切なラベルを付ける専門家です。回答は必ずJSON形式の配列のみを返してください。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    // レスポンスからラベルを抽出
    const content = response.choices[0].message.content;
    if (!content) {
      logger.warn("LLM returned empty content");
      return [];
    }

    try {
      // JSONレスポンスをパース
      const parsedContent = JSON.parse(content);

      // labels キーがある場合はその値を使用、なければ直接配列を使用
      const selectedLabels = Array.isArray(parsedContent.labels)
        ? parsedContent.labels
        : Array.isArray(parsedContent)
        ? parsedContent
        : [];

      // 実際に存在するラベル名のみをフィルタリング
      const validLabels = selectedLabels.filter((label) =>
        labels.some((l) => l.name === label)
      );

      logger.info(
        `LLM selected labels for PR: ${validLabels.join(", ") || "none"}`
      );
      return validLabels;
    } catch (parseError) {
      logger.error({ error: parseError }, "Failed to parse LLM response");

      // パースに失敗した場合、テキストから直接ラベル名を抽出する試み
      const labelMatches = content.match(/"([^"]+)"/g);
      if (labelMatches) {
        const extractedLabels = labelMatches
          .map((match) => match.replace(/"/g, ""))
          .filter((label) => labels.some((l) => l.name === label));

        logger.info(
          `Extracted labels from unparseable response: ${
            extractedLabels.join(", ") || "none"
          }`
        );
        return extractedLabels;
      }

      return [];
    }
  } catch (error) {
    logger.error({ error }, "Error calling LLM for label selection");
    return [];
  }
}

/**
 * PRにラベルを適用する
 * @param octokit 認証済みOctokitインスタンス
 * @param prNumber PR番号
 * @param labels 適用するラベル名の配列
 */
export async function applyLabelsToPR(
  octokit: Octokit,
  prNumber: number,
  labels: string[]
): Promise<void> {
  if (labels.length === 0) {
    logger.info(`No labels to apply to PR #${prNumber}`);
    return;
  }

  const owner = config.GITHUB_TARGET_OWNER;
  const repo = config.GITHUB_TARGET_REPO;

  logger.info(`Applying labels to PR #${prNumber}: ${labels.join(", ")}`);

  try {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: prNumber,
      labels,
    });
    logger.info(`Successfully applied labels to PR #${prNumber}`);
  } catch (error) {
    logger.error({ error }, `Failed to apply labels to PR #${prNumber}`);
    throw error;
  }
}
```

### 2. 既存ファイルの修正

#### 2.1 `policy-edit/mcp/src/handlers/updatePr.ts` の修正

PR 更新時にラベル付け機能を呼び出す処理を追加します：

```typescript
import {
  fetchRepoLabels,
  selectLabelsWithLLM,
  applyLabelsToPR,
} from "../github/labels.js";

// handleUpdatePr 関数内の修正部分
// PRの更新後、LLMを使用してラベルを適用する処理を追加

// 既存のコード...
const { data: updatedPr } = await octokit.rest.pulls.update({
  ...updatePayload,
});

// ここから新規追加部分
// ラベルを取得して適用
try {
  const labels = await fetchRepoLabels(octokit);
  const selectedLabels = await selectLabelsWithLLM(
    updatedPr.title,
    updatedPr.body || "",
    labels
  );

  if (selectedLabels.length > 0) {
    await applyLabelsToPR(octokit, pull_number, selectedLabels);
    logger.info(
      `Applied LLM-selected labels to PR #${pull_number}: ${selectedLabels.join(
        ", "
      )}`
    );
  }
} catch (labelError) {
  // ラベル適用に失敗しても、PR更新自体は成功とする
  logger.error(
    { error: labelError },
    `Failed to apply LLM-selected labels to PR #${pull_number}, but PR was updated successfully`
  );
}
// ここまで新規追加部分

const updatedFields = title ? "title and description" : "description";
// 既存のコード...
```

#### 2.2 `policy-edit/mcp/src/github/utils.ts` の修正

PR 作成時にもラベル付け機能を呼び出す処理を追加します：

```typescript
import {
  fetchRepoLabels,
  selectLabelsWithLLM,
  applyLabelsToPR,
} from "./labels.js";

// findOrCreateDraftPr 関数内の修正部分
// 新規PR作成時にLLMを使用してラベルを適用する処理を追加

// 既存のコード...
const { data: newPr } = await octokit.rest.pulls.create({
  owner,
  repo,
  title: title,
  head: branchName,
  base: baseBranch,
  body: body,
  draft: true,
});

// ここから新規追加部分
// ラベルを取得して適用
try {
  const labels = await fetchRepoLabels(octokit);
  const selectedLabels = await selectLabelsWithLLM(title, body, labels);

  if (selectedLabels.length > 0) {
    await applyLabelsToPR(octokit, newPr.number, selectedLabels);
    logger.info(
      `Applied LLM-selected labels to new PR #${
        newPr.number
      }: ${selectedLabels.join(", ")}`
    );
  }
} catch (labelError) {
  // ラベル適用に失敗しても、PR作成自体は成功とする
  logger.error(
    { error: labelError },
    `Failed to apply LLM-selected labels to new PR #${newPr.number}, but PR was created successfully`
  );
}
// ここまで新規追加部分

logger.info(
  `Created draft PR #${newPr.number} for branch ${branchName}. URL: ${newPr.html_url}`
);
// 既存のコード...
```

### 3. テスト手順

1. 実装後、以下のテストを実施して機能が正しく動作することを確認します：

   - 新規 PR 作成時にラベルが自動的に付与されることを確認
   - PR 更新時にラベルが適切に更新されることを確認
   - 様々な内容の PR に対して適切なラベルが選択されることを確認
   - エラー発生時にも PR 作成・更新自体は成功することを確認

2. LLM のレスポンスをログに記録し、必要に応じてプロンプトを調整します。

## 拡張性と改善点

1. **LLM プロンプトの最適化**:

   - プロンプトエンジニアリングを通じて、より精度の高いラベル選択を実現できます。
   - ラベルの説明が充実している場合、それを活用してより適切なラベル選択が可能になります。

2. **コンテキスト拡充**:

   - PR の変更内容（差分）も LLM に送信することで、より正確なラベル選択が可能になります。
   - リポジトリの特性や過去の PR パターンを学習させることも検討できます。

3. **フォールバックメカニズム**:

   - LLM が適切に応答しない場合のために、キーワードベースのフォールバックメカニズムを実装することも有効です。

4. **ユーザーフィードバック**:

   - 自動選択されたラベルに対するユーザーフィードバックを収集し、プロンプトを改善する仕組みを追加できます。

5. **バッチ処理とキャッシュ**:
   - LLM API の呼び出しコストを削減するために、類似 PR のラベル選択結果をキャッシュする仕組みを検討できます。

## まとめ

この実装により、PR を作成・更新する際に、LLM がその内容を分析して適切なラベルを自動的に付与するようになります。また、毎回 GitHub から最新のラベルリストを取得するため、ラベルが変更されても対応できます。LLM を活用することで、単純なキーワードマッチングよりも高度で文脈を理解したラベル選択が可能になります。

# 変更提案の適切なファイル自動選択機能

## 背景と課題

現在のpolicy-editリポジトリでは、ユーザーからチャットで変更提案を受け取り、GitHub PRを自動作成する機能が実装されています。しかし、現状では常に「現在表示しているページ」に対してPRが作成されるため、多くのユーザーがトップページ（README）に変更提案を出してしまっています。

実際には、提案内容に応じて適切なファイル（例：教育に関する提案は教育ページ）に変更を反映させることが望ましいです。そこで、ユーザーの提案内容を分析し、最も適切なファイルを自動的に選択する機能を追加します。

## 機能概要

ユーザーの変更提案を受け取った際に、その内容を分析し、リポジトリ内の既存ファイルの中から最も適切なファイルを選択して変更を適用します。

1. 対象リポジトリの `/.meta/target_file_rules.txt` から取得したルールに基づいて、提案内容に最適なファイルを判断
2. ルールファイルの取得に失敗した場合は、ファイル名のみから判定
3. 選択されたファイルに対して変更を適用し、PRを作成
4. ユーザーに選択されたファイルとその理由を説明

## 技術設計

### 1. ルール設定ファイルの取得

対象リポジトリの `/.meta/target_file_rules.txt` からルールファイルを取得します。このファイルには、提案内容とファイルのマッピングルールがフローチャート形式で定義されています。

**target_file_rules.txtの例：**

```
# 変更提案の適切なファイル選択ルール
# 各行は「キーワード/トピック：ファイルパス」の形式で記述

# 教育関連
教育, 学校, 学習, 授業, カリキュラム: education/policy.md

# 環境関連
環境, 気候変動, エコ, 再生可能エネルギー: environment/climate_policy.md

# 経済関連
経済, 財政, 税制, 予算: economy/fiscal_policy.md

# デフォルト（該当するルールがない場合）
デフォルト: README.md
```

### 2. MCPサーバーでのファイル選択ツールの実装

ファイル選択ロジックをMCPクライアントからMCPサーバーに移動し、専用のツールとして実装します：

1. MCPサーバーに新しいツール `determine_target_file` を追加
2. このツールは、ユーザーの提案内容と現在のファイルパスを入力として受け取り、最適なファイルパスと選択理由を返す
3. 対象リポジトリから`/.meta/target_file_rules.txt`を取得し、取得成功時はそのルールに基づいて判定
4. 取得失敗時はファイル名のみから判定
5. LLMを使用して提案内容を分析し、適切なファイルを選択

```typescript
// policy-edit/mcp/src/handlers/determineTargetFile.ts

import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import config from "../config.js";
import { getAuthenticatedOctokit } from "../github/client.js";
import logger from "../logger.js";
import { OpenAI } from "openai";

// ツール入力のスキーマ定義
export const determineTargetFileSchema = z.object({
  query: z.string().min(1),
  currentFilePath: z.string(),
});

export type DetermineTargetFileInput = z.infer<typeof determineTargetFileSchema>;

// ファイルルールの型定義
interface FileRule {
  keywords: string[];
  filePath: string;
}

export async function handleDetermineTargetFile(
  params: DetermineTargetFileInput
): Promise<CallToolResult> {
  const { query, currentFilePath } = params;

  try {
    // 1. 対象リポジトリからルールファイルを取得
    const octokit = await getAuthenticatedOctokit();
    const owner = config.GITHUB_TARGET_OWNER;
    const repo = config.GITHUB_TARGET_REPO;
    const baseBranch = config.GITHUB_BASE_BRANCH;
    const rulesFilePath = '.meta/target_file_rules.txt';

    let rules: FileRule[] = [];
    let rulesSource = 'filename'; // デフォルトはファイル名のみから判定

    try {
      // リポジトリからルールファイルを取得
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: rulesFilePath,
        ref: baseBranch,
      });

      if (!Array.isArray(data) && data.type === 'file' && data.content) {
        // Base64でエンコードされたコンテンツをデコード
        const rulesContent = Buffer.from(data.content, 'base64').toString('utf-8');
        rules = parseRulesFile(rulesContent);
        rulesSource = 'rules';
        logger.info(`Successfully loaded rules from ${rulesFilePath}`);
      }
    } catch (error) {
      logger.warn(`Rules file not found at ${rulesFilePath}, will use filename-based selection`);
      // ルールファイルが見つからない場合は、ファイル名のみから判定するモードに
    }

    // 2. 既存ファイル一覧の取得（リポジトリ内の.mdファイル）
    const existingFiles = await getRepositoryFiles(octokit, owner, repo, baseBranch);

    // 3. 判定方法に応じて処理を分岐
    let result;
    if (rulesSource === 'rules' && rules.length > 0) {
      // ルールファイルが取得できた場合、LLMを使用して最適なファイルを選択
      result = await callLLMForFileSelection(query, rules, existingFiles, currentFilePath);
    } else {
      // ルールファイルが取得できなかった場合、ファイル名のみから判定
      result = await selectFileByName(query, existingFiles, currentFilePath);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            targetFilePath: result.targetFilePath,
            reason: result.reason
          })
        }
      ]
    };
  } catch (error) {
    logger.error("Error determining target file:", error);

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error determining target file: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
}

// ルールファイルのパース
function parseRulesFile(content: string): FileRule[] {
  const rules: FileRule[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // コメント行やからの行をスキップ
    if (line.trim().startsWith('#') || line.trim() === '') continue;

    // キーワード: ファイルパス の形式をパース
    const match = line.match(/^(.*?):\s*(.*)$/);
    if (match) {
      const keywords = match[1].split(',').map(k => k.trim());
      const filePath = match[2].trim();
      rules.push({ keywords, filePath });
    }
  }

  return rules;
}

// リポジトリ内のファイル一覧取得（GitHub APIを使用）
async function getRepositoryFiles(
  octokit: any,
  owner: string,
  repo: string,
  baseBranch: string
): Promise<string[]> {
  // リポジトリ内のファイル一覧を再帰的に取得
  async function getFilesRecursively(path = ''): Promise<string[]> {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: baseBranch,
    });

    let files: string[] = [];

    for (const item of Array.isArray(data) ? data : [data]) {
      if (item.type === 'file' && item.path.endsWith('.md')) {
        files.push(item.path);
      } else if (item.type === 'dir') {
        const subFiles = await getFilesRecursively(item.path);
        files = [...files, ...subFiles];
      }
    }

    return files;
  }

  return getFilesRecursively();
}

// ファイル名のみから判定するメソッド
async function selectFileByName(
  query: string,
  existingFiles: string[],
  currentFilePath: string
): Promise<{ targetFilePath: string; reason: string }> {
  // LLMに送信するプロンプト
  const prompt = `
あなたは政策提案の内容を分析し、最も適切なファイルを選択するアシスタントです。
以下の変更提案を分析し、ファイル名だけを見て、どのファイルに適用するのが最も適切か判断してください。

【ユーザーの変更提案】
${query}

【利用可能なファイル一覧】
${existingFiles.join('\n')}

【現在表示中のファイル】
${currentFilePath}

以下の形式で回答してください：
ファイルパス: [選択したファイルのパス]
理由: [選択理由の説明]
`;

  // LLM APIを呼び出し
  const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: "google/gemini-2.5-pro-preview-03-25",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
  });

  // レスポンスからファイルパスと理由を抽出
  const content = response.choices[0].message.content || "";
  const filePathMatch = content.match(/ファイルパス:\s*(.+)/);
  const reasonMatch = content.match(/理由:\s*(.+)/);

  const targetFilePath = filePathMatch ? filePathMatch[1].trim() : currentFilePath;
  const reason = reasonMatch
    ? reasonMatch[1].trim() + "（ファイル名のみから判断しました）"
    : "ファイル名から最適なファイルを判断しました";

  // 選択されたファイルが存在するか確認
  if (!existingFiles.includes(targetFilePath)) {
    logger.warn(`Selected file ${targetFilePath} does not exist, using current file path`);
    return {
      targetFilePath: currentFilePath,
      reason: `選択されたファイル ${targetFilePath} が存在しないため、現在のファイルを使用します。`
    };
  }

  return { targetFilePath, reason };
}

// LLMを使用したファイル選択（ルールベース）
async function callLLMForFileSelection(
  query: string,
  rules: FileRule[],
  existingFiles: string[],
  currentFilePath: string
): Promise<{ targetFilePath: string; reason: string }> {
  // LLMに送信するプロンプト
  const prompt = `
あなたは政策提案の内容を分析し、最も適切なファイルを選択するアシスタントです。
以下の変更提案を分析し、どのファイルに適用するのが最も適切か判断してください。

【ユーザーの変更提案】
${query}

【利用可能なファイル一覧】
${existingFiles.join('\n')}

【ファイル選択ルール】
${rules.map(r => `- キーワード [${r.keywords.join(', ')}] => ${r.filePath}`).join('\n')}

【現在表示中のファイル】
${currentFilePath}

以下の形式で回答してください：
ファイルパス: [選択したファイルのパス]
理由: [選択理由の説明]
`;

  // LLM APIを呼び出し
  const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: "google/gemini-2.5-pro-preview-03-25",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
  });

  // レスポンスからファイルパスと理由を抽出
  const content = response.choices[0].message.content || "";
  const filePathMatch = content.match(/ファイルパス:\s*(.+)/);
  const reasonMatch = content.match(/理由:\s*(.+)/);

  const targetFilePath = filePathMatch ? filePathMatch[1].trim() : currentFilePath;
  const reason = reasonMatch
    ? reasonMatch[1].trim() + "（リポジトリのルールファイルに基づいて判断しました）"
    : "リポジトリのルールファイルに基づいて最適なファイルを判断しました";

  // 選択されたファイルが存在するか確認
  if (!existingFiles.includes(targetFilePath)) {
    logger.warn(`Selected file ${targetFilePath} does not exist, using current file path`);
    return {
      targetFilePath: currentFilePath,
      reason: `選択されたファイル ${targetFilePath} が存在しないため、現在のファイルを使用します。`
    };
  }

  return { targetFilePath, reason };
}
```

### 3. MCPサーバーへのツール登録

`server.ts` ファイルにツールを登録します：

```typescript
// policy-edit/mcp/src/server.ts に追加

import { handleDetermineTargetFile, determineTargetFileSchema } from "./handlers/determineTargetFile.js";

// 既存のツール登録に追加
const determineTargetFileAnnotations = {
  title: "Determine Target File",
  description: "Analyzes change content and determines the most appropriate file to apply the changes to.",
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

server.tool(
  "determine_target_file",
  determineTargetFileSchema.shape,
  handleDetermineTargetFile
);
```

### 4. クライアント側での実装

クライアント側では、MCPツールを呼び出してファイル選択を行います：

```typescript
// クライアント側のコード例

// ユーザーの提案内容に基づいて適切なファイルを選択
if (filePath) {
  try {
    // MCPツールを呼び出し
    const result = await mcpClient.callTool("determine_target_file", {
      query: userProposal,
      currentFilePath: filePath
    });

    // 結果をJSONとしてパース
    const { targetFilePath, reason } = JSON.parse(result);

    // 選択されたファイルパスと理由を使用
    console.log(`Selected file: ${targetFilePath}`);
    console.log(`Reason: ${reason}`);

    // 選択されたファイルが現在のファイルと異なる場合、そのファイルの内容を取得
    if (targetFilePath !== filePath) {
      // ファイル内容取得処理...
    }
  } catch (error) {
    console.error("Error determining target file:", error);
    // エラー処理...
  }
}
```

### 5. フロントエンドの変更

フロントエンドでは、選択されたファイルがユーザーに表示されるように、UIを更新します。

1. ユーザーに選択されたファイルとその理由を表示
2. 必要に応じて、ユーザーがファイル選択を変更できるオプションを提供

## 実装計画

1. **フェーズ1: 基本機能の実装**
   - MCPサーバーに `determine_target_file` ツールを実装
   - ルールファイル取得機能の実装
   - ファイル名のみから判定するロジックの実装
   - クライアント側でのツール呼び出し実装

2. **フェーズ2: 拡張機能の実装**
   - ユーザーへのフィードバック改善
   - ファイル選択の精度向上
   - ユーザーによるファイル選択の上書きオプション

3. **フェーズ3: テストと最適化**
   - 様々な提案内容でのテスト
   - ルールの最適化
   - パフォーマンス改善

## 期待される効果

1. ユーザーの提案が適切なファイルに反映されるようになり、リポジトリの構造が改善される
2. READMEページへの不適切な変更提案が減少する
3. 提案内容に基づいた適切なファイル選択により、レビュープロセスが効率化される
4. ユーザーエクスペリエンスの向上（提案が適切な場所に反映されることで満足度が向上）

## 技術的考慮事項

1. **パフォーマンス**: ファイル選択プロセスによる応答時間の増加を最小限に抑える
2. **エラーハンドリング**: ファイル選択に失敗した場合のフォールバック戦略
3. **セキュリティ**: ユーザー入力とファイルパスの検証
4. **スケーラビリティ**: リポジトリのファイル数が増加した場合の対応

## まとめ

この機能により、ユーザーの変更提案が自動的に最適なファイルに振り分けられるようになり、リポジトリの構造と内容の質が向上します。対象リポジトリから直接ルールを取得することで、ルールの一元管理が可能になり、メンテナンス性も向上します。ルールファイルが取得できない場合でも、ファイル名のみから判定することで、常に最適なファイル選択を試みます。LLMを活用したインテリジェントなファイル選択により、ユーザーは技術的な詳細を気にすることなく、内容に集中して提案を行うことができます。

MCPサーバー側でこの機能を実装することで、複数のクライアントから同じロジックを利用できるようになり、一貫性のあるファイル選択が可能になります。また、ロジックの更新も一箇所で行えるため、メンテナンス性が向上します。

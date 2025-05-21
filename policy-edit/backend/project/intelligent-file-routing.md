# 変更提案の適切なファイル自動選択機能

## 背景と課題

現在のpolicy-editリポジトリでは、ユーザーからチャットで変更提案を受け取り、GitHub PRを自動作成する機能が実装されています。しかし、現状では常に「現在表示しているページ」に対してPRが作成されるため、多くのユーザーがトップページ（README）に変更提案を出してしまっています。

実際には、提案内容に応じて適切なファイル（例：教育に関する提案は教育ページ）に変更を反映させることが望ましいです。そこで、ユーザーの提案内容を分析し、最も適切なファイルを自動的に選択する機能を追加します。

## 機能概要

ユーザーの変更提案を受け取った際に、その内容を分析し、リポジトリ内の既存ファイルの中から最も適切なファイルを選択して変更を適用します。

1. 設定ファイル（target_file_rules.txt）に定義されたルールに基づいて、提案内容に最適なファイルを判断
2. 選択されたファイルに対して変更を適用し、PRを作成
3. ユーザーに選択されたファイルとその理由を説明

## 技術設計

### 1. ルール設定ファイルの作成と読み込み

`target_file_rules.txt`ファイルを作成し、提案内容とファイルのマッピングルールをフローチャート形式で定義します。このファイルは環境変数のように設定され、gitignoreされます。

```
policy-edit/
  ├── backend/
  │   └── src/
  │       └── config/
  │           └── target_file_rules.txt (gitignore対象)
```

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

### 2. ファイル選択ロジックの実装

MCPクライアントの処理フローに、ファイル選択ステップを追加します：

1. `McpClient`クラスに新しいメソッド`determineTargetFile`を追加
2. このメソッドは、ユーザーの提案内容と現在のファイルパスを入力として受け取り、最適なファイルパスを返す
3. LLMを使用して提案内容を分析し、ルールに基づいて適切なファイルを選択

```typescript
// policy-edit/backend/src/mcp/client.ts に追加

import fs from 'fs';
import path from 'path';

// ファイルルールの型定義
interface FileRule {
  keywords: string[];
  filePath: string;
}

// ターゲットファイル決定メソッド
async function determineTargetFile(
  query: string,
  currentFilePath: string
): Promise<{ targetFilePath: string; reason: string }> {
  try {
    // 1. ルールファイルの読み込み
    const rulesFilePath = path.resolve(process.env.TARGET_FILE_RULES_PATH || './config/target_file_rules.txt');
    if (!fs.existsSync(rulesFilePath)) {
      logger.warn(`Rules file not found at ${rulesFilePath}, using current file path`);
      return {
        targetFilePath: currentFilePath,
        reason: "ルールファイルが見つからないため、現在のファイルを使用します。"
      };
    }

    const rulesContent = fs.readFileSync(rulesFilePath, 'utf-8');
    const rules: FileRule[] = parseRulesFile(rulesContent);

    // 2. 既存ファイル一覧の取得（リポジトリ内の.mdファイル）
    const existingFiles = await getRepositoryFiles();

    // 3. LLMを使用して最適なファイルを選択
    const result = await this.callLLMForFileSelection(query, rules, existingFiles, currentFilePath);

    return result;
  } catch (error) {
    logger.error("Error determining target file:", error);
    return {
      targetFilePath: currentFilePath,
      reason: "ファイル選択中にエラーが発生したため、現在のファイルを使用します。"
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

// LLMを使用したファイル選択
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
  const reason = reasonMatch ? reasonMatch[1].trim() : "LLMによる判断";

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

// リポジトリ内のファイル一覧取得（GitHub APIを使用）
async function getRepositoryFiles(): Promise<string[]> {
  const octokit = await getAuthenticatedOctokit();
  const owner = config.GITHUB_TARGET_OWNER;
  const repo = config.GITHUB_TARGET_REPO;
  const baseBranch = config.GITHUB_BASE_BRANCH;

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
```

### 3. 処理フローの変更

`processQuery`メソッドを修正して、ファイル選択ロジックを組み込みます：

```typescript
// policy-edit/backend/src/mcp/client.ts の processQuery メソッドを修正

async processQuery(
  query: string,
  history: OpenAI.Chat.ChatCompletionMessageParam[] = [],
  branchId?: string,
  fileContent?: string,
  userName?: string,
  filePath?: string
): Promise<string> {
  if (!this._initialized || !this.mcp) {
    return "Error: MCP client is not connected.";
  }

  // ファイル選択ロジックを追加
  let targetFilePath = filePath || "";
  let fileSelectionReason = "";

  // ユーザーの提案内容に基づいて適切なファイルを選択
  if (filePath) {
    const fileSelection = await this.determineTargetFile(query, filePath);
    targetFilePath = fileSelection.targetFilePath;
    fileSelectionReason = fileSelection.reason;

    // 選択されたファイルが現在のファイルと異なる場合、そのファイルの内容を取得
    if (targetFilePath !== filePath) {
      try {
        const octokit = await getAuthenticatedOctokit();
        const owner = config.GITHUB_TARGET_OWNER;
        const repo = config.GITHUB_TARGET_REPO;
        const baseBranch = config.GITHUB_BASE_BRANCH;

        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: targetFilePath,
          ref: baseBranch,
        });

        if (!Array.isArray(data) && data.type === 'file' && data.content) {
          // Base64でエンコードされたコンテンツをデコード
          fileContent = Buffer.from(data.content, 'base64').toString('utf-8');
        }
      } catch (error) {
        logger.error(`Error fetching content for ${targetFilePath}:`, error);
        // エラーが発生した場合は元のファイルパスとコンテンツを使用
        targetFilePath = filePath;
        fileSelectionReason = "選択したファイルの内容取得に失敗したため、現在のファイルを使用します。";
      }
    }
  }

  // 以下、既存の処理を継続...
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `あなたは、ユーザーが政策案の改善提案を作成するのを支援するAIアシスタントです。「現在のファイル内容」として提供された政策文書について、ユーザー（名前：${userName || "不明"}）が改善提案を練り上げるのを手伝うことがあなたの目標です。

      政策案は共有オンラインワークスペース（GitHub）で保管・管理されています。あなたのタスクは、改善の可能性についてユーザーと議論し、ファイル内容を変更し、他の人によるレビューのために準備することです。

      以下の手順で協力しましょう：
      1.  **改善点の議論:** ユーザーが政策改善のアイデアを共有します。これらのアイデアについて、批判的に議論してください。ユーザーの提案に疑問を投げかけ、最終的な変更が強力でよく考慮されたものになるように、その影響をユーザーが考えるのを手伝ってください。提供されたテキストのみを扱ってください。
      2.  **下書きの編集:** 具体的な変更点について合意したら、利用可能なツールを使って、これらの変更をあなた専用の下書きスペース（ブランチ）にて、「${targetFilePath}」にあるファイルの新しいバージョン（コミット）として保存します。これはユーザーの個人的な編集作業です。変更点の要約を提示して最終確認を求め、承認を得たら直接変更をコミットします。変更箇所は本当に必要なものだけにしてください。コミットメッセージにはユーザー名（${userName || "不明"}）を含めてください。
          この作業は、ユーザーが望む限り何度でも繰り返せます。
      3.  **改善提案の投稿の準備:** 下書きの編集にユーザーが満足したら、改善提案を投稿する準備をします。利用可能なツールを使ってプルリクエストのタイトルと説明を設定してください。ツールで設定するプルリクエストの説明には、行われた改善点、その意図や目的、背景などを可能な限り明確かつ詳細（1000文字以上）に述べ、ユーザー名（${userName || "匿名"}）を記載しましょう。このメッセージは、変更内容とその理由を他の人に伝えるために使われます（プルリクエスト）。
      4.  **リンクの共有:** ツールを使ってプルリクエストを更新した後に、提案された変更へのウェブリンク（プルリクエストリンク）をユーザーに提供してください。

      注意点：ユーザーは「Git」、「コミット」、「ブランチ」、「プルリクエスト」のような技術用語に詳しくありません。プロセスやあなたが取る行動を説明する際には、シンプルで日常的な言葉を使用してください。提供された政策文書の内容改善にのみ集中しましょう。

      ${fileSelectionReason ? `【ファイル選択について】: ${fileSelectionReason}` : ''}

      返答は最大500文字。`,
    },
    ...history,
  ];

  // 以下、既存の処理を継続...
}
```

### 4. フロントエンドの変更

フロントエンドでは、選択されたファイルがユーザーに表示されるように、UIを更新します。

1. ユーザーに選択されたファイルとその理由を表示
2. 必要に応じて、ユーザーがファイル選択を変更できるオプションを提供

## 実装計画

1. **フェーズ1: 基本機能の実装**
   - target_file_rules.txt ファイルの作成と読み込み機能の実装
   - determineTargetFile メソッドの実装
   - processQuery メソッドの修正

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

この機能により、ユーザーの変更提案が自動的に最適なファイルに振り分けられるようになり、リポジトリの構造と内容の質が向上します。LLMを活用したインテリジェントなファイル選択により、ユーザーは技術的な詳細を気にすることなく、内容に集中して提案を行うことができます。

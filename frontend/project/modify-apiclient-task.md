# API クライアント修正タスク

## 背景

API の仕様が変更され、テーマベースのエンドポイント構造に移行しました。以下は元の API 仕様と新しい API 仕様の比較です：

### 元の API 仕様

```
GET /api/questions                           - すべての質問を取得
GET /api/questions/:questionId/details       - 特定の質問の詳細を取得
POST /api/questions/:questionId/generate-policy - ポリシードラフト生成
POST /api/questions/:questionId/generate-digest - ダイジェストドラフト生成

GET /api/admin/problems                      - 問題一覧取得
GET /api/admin/solutions                     - 解決策一覧取得
POST /api/admin/generate-questions           - 質問生成

GET /api/policy-drafts                       - ポリシードラフト一覧取得
GET /api/digest-drafts                       - ダイジェストドラフト一覧取得
GET /api/import                              - インポートアイテム取得
GET /api/chat                                - チャット関連エンドポイント
```

### 新しい API 仕様

```
GET /api/themes                              - テーマ一覧取得
GET /api/themes/:themeId                     - 特定のテーマ詳細取得
POST /api/themes                             - 新しいテーマ作成
PUT /api/themes/:themeId                     - テーマ更新
DELETE /api/themes/:themeId                  - テーマ削除

GET /api/themes/:themeId/questions           - 特定テーマの質問一覧取得
GET /api/themes/:themeId/questions/:questionId/details - 特定の質問の詳細を取得
POST /api/themes/:themeId/questions/:questionId/generate-policy - ポリシードラフト生成
POST /api/themes/:themeId/questions/:questionId/generate-digest - ダイジェストドラフト生成

GET /api/themes/:themeId/problems            - 特定テーマの問題一覧取得
GET /api/themes/:themeId/solutions           - 特定テーマの解決策一覧取得
POST /api/themes/:themeId/generate-questions - 特定テーマの質問生成

GET /api/themes/:themeId/policy-drafts       - 特定テーマのポリシードラフト一覧取得
GET /api/themes/:themeId/digest-drafts       - 特定テーマのダイジェストドラフト一覧取得
POST /api/themes/:themeId/import/generic     - 特定テーマのデータインポート
POST /api/themes/:themeId/chat/messages      - 特定テーマのチャットメッセージ送信
GET /api/themes/:themeId/chat/threads/:threadId/extractions - 特定テーマのスレッド抽出取得
GET /api/themes/:themeId/chat/threads/:threadId/messages - 特定テーマのスレッドメッセージ取得
```

## 完了したタスク

以下の API クライアントメソッドは既に修正済みです：

1. ✅ `sendMessage()` - テーマ ID を必須パラメータとして追加し、エンドポイントを `/chat/messages` から `/themes/${themeId}/chat/messages` に変更
2. ✅ `getThreadExtractions()` - テーマ ID を必須パラメータとして追加し、エンドポイントを `/chat/threads/${threadId}/extractions` から `/themes/${themeId}/chat/threads/${threadId}/extractions` に変更
3. ✅ `getThreadMessages()` - テーマ ID を必須パラメータとして追加し、エンドポイントを `/chat/threads/${threadId}/messages` から `/themes/${themeId}/chat/threads/${threadId}/messages` に変更

## 残りのタスク

### API クライアントの修正

1. `getAllQuestions()` メソッドの修正

   - テーマ ID を必須パラメータとして追加
   - エンドポイントを `/questions` から `/themes/${themeId}/questions` に変更
   - このメソッドを呼び出している箇所も修正

2. `getQuestionDetails()` メソッドの修正

   - テーマ ID を必須パラメータに変更（現在はオプショナル）
   - 条件分岐を削除し、常に `/themes/${themeId}/questions/${questionId}/details` を使用
   - このメソッドを呼び出している箇所も修正

3. `generateQuestions()` メソッドの修正

   - テーマ ID を必須パラメータに変更（現在はオプショナル）
   - 条件分岐を削除し、常に `/themes/${themeId}/generate-questions` を使用
   - このメソッドを呼び出している箇所も修正

4. `getAllProblems()` メソッドの修正

   - テーマ ID を必須パラメータとして追加
   - エンドポイントを `/admin/problems` から `/themes/${themeId}/problems` に変更
   - このメソッドを呼び出している箇所も修正

5. `getAllSolutions()` メソッドの修正

   - テーマ ID を必須パラメータとして追加
   - エンドポイントを `/admin/solutions` から `/themes/${themeId}/solutions` に変更
   - このメソッドを呼び出している箇所も修正

6. `getAllPolicyDrafts()` メソッドの修正

   - テーマ ID を必須パラメータとして追加
   - エンドポイントを `/policy-drafts` から `/themes/${themeId}/policy-drafts` に変更
   - このメソッドを呼び出している箇所も修正

7. `getAllDigestDrafts()` メソッドの修正
   - テーマ ID を必須パラメータとして追加
   - エンドポイントを `/digest-drafts` から `/themes/${themeId}/digest-drafts` に変更
   - このメソッドを呼び出している箇所も修正

### コンポーネントの修正

8. `DataPage.tsx` の修正

   - `getAllProblems()`, `getAllSolutions()`, `getAllQuestions()` などの呼び出しにテーマ ID を追加
   - 必要に応じて、コンポーネントの状態にテーマ ID を追加

9. `MainPage.tsx` の修正

   - `getAllQuestions()` などの呼び出しにテーマ ID を追加
   - 必要に応じて、コンポーネントの状態にテーマ ID を追加

10. `QuestionDetail.tsx` の修正

    - `getQuestionDetails()` の呼び出しにテーマ ID を追加
    - `generatePolicy()`, `generateDigest()` の呼び出しを確認
    - 必要に応じて、コンポーネントの状態にテーマ ID を追加

11. `AdminPanel.tsx` の修正（存在する場合）
    - `generateQuestions()` などの呼び出しにテーマ ID を追加
    - 必要に応じて、コンポーネントの状態にテーマ ID を追加

## 実装の注意点

1. テーマ ID の取得方法

   - `getDefaultTheme()` メソッドを使用して、デフォルトのテーマ ID を取得
   - ローカルストレージにテーマ ID を保存して再利用
   - ユーザーがテーマを選択できる UI を追加（必要に応じて）

2. 後方互換性を無視する

   - リリース前のサービスなので後方互換性は一切不要

3. エラーハンドリング
   - テーマ ID が存在しない場合のエラーハンドリングを追加
   - API エラーを適切に処理し、ユーザーに通知

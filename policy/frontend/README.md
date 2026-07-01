# いどばた政策 フロントエンド

「いどばた政策」のフロントエンドです。Web 上に公開された施策案（Markdown）を閲覧し、AI と対話しながら改善提案を作成して GitHub の Pull Request として提出するためのユーザー画面を提供します。

React + TypeScript + Vite で構築されています。

## 起動方法

通常はリポジトリルートの Docker Compose でまとめて起動します。詳細は [../../docs/development-setup.md](../../docs/development-setup.md) を参照してください。

```bash
# リポジトリルートで
docker compose up --build -d policy-frontend policy-backend postgres-policy
```

このフロントエンドのみを個別に起動する場合:

```bash
cd policy/frontend
npm install
npm run dev   # 既定ポート: 5174（Docker 経由の場合）
```

## 主な環境変数

`.env`（リポジトリルートの `.env.template` をコピー）で設定します。フロントエンドからは `VITE_` プレフィックスの変数が参照されます。

- `VITE_API_BASE_URL`: バックエンド API の URL（`POLICY_FRONTEND_API_BASE_URL` から渡されます）
- `VITE_USE_MOCK_GITHUB_CLIENT`: `true` にすると実際の GitHub API を呼ばずモッククライアントを使用します。GitHub App を用意せず UI を試す「お試し構成」に便利です
- `VITE_GITHUB_REPO_OWNER` / `VITE_GITHUB_REPO_NAME`: 対象リポジトリ（`GITHUB_TARGET_OWNER` / `GITHUB_TARGET_REPO` から渡されます）
- `VITE_SITE_NAME`、`VITE_SITE_LOGO_URL`、`VITE_COLOR_*` など: サイト名・ロゴ・カラーテーマのカスタマイズ
- `VITE_POLICY_CHAT_WELCOME_MESSAGE`: チャット開始時の挨拶メッセージ

利用可能な変数の一覧と説明はリポジトリルートの `.env.template` を参照してください。

## 設計上の注意

- このフロントエンドの GitHub クライアントは**読み取り専用**です。文言の変更はローカルで即時反映されるのではなく、バックエンド経由で**新しいブランチへのコミット → Pull Request 提案**という形で行われます。
- GitHub への通信（コミットや PR 作成・更新）はバックエンド（`policy/backend`）内で直接実行されます。

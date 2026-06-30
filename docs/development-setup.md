# Idobata プロジェクト - 開発環境構築手順

## 重要なドキュメント

- [プロジェクト概要](./README.md)
- [プロジェクト状況](./project_status.md) (開発者向け)
- [開発環境構築ガイド](./development-setup.md) (開発者向け、本ドキュメント)
- [コントリビューションガイド](./CONTRIBUTING.md) (開発者向け)

このドキュメントでは、`idea-discussion` および `policy-edit` アプリケーションの開発環境を Docker Compose を使用してセットアップし、実行する方法について説明します。これらは独立してセットアップ・実行可能です。

## プロジェクト構成

このプロジェクトは以下のコンポーネントで構成されています：

- **vision/frontend**: idea-discussion（いどばたビジョン）用のフロントエンドとして機能しています。TypeScript をサポートし、JSX と TSX の両方のファイル形式を扱えます。
- **vision/idea-discussion/backend**: アイデア議論のためのバックエンド（Node.js）
- **vision/admin**: いどばたビジョンの管理画面（React + TypeScript）
- **vision/python-service**: 埋め込み生成のための Python サービス
- **policy**: ポリシー編集（いどばた政策）のフロントエンド（React + TypeScript）とバックエンド（Node.js）（`policy/frontend`, `policy/backend`）。GitHub への通信（ファイルのコミットや PR の作成・更新）はバックエンド内で直接実行されます
- **MongoDB**: データベース

## 前提条件

- **Docker:** お使いのオペレーティングシステム用の Docker Desktop（または Docker Engine + Docker Compose）をインストールしてください。[https://www.docker.com/get-started](https://www.docker.com/get-started)
- **リポジトリのクローン:** まず、プロジェクトリポジトリをクローンします。
  ```bash
  git clone <your-repository-url>
  cd idobata
  ```

## セットアップ

### 共通のセットアップ

1.  **`.env` ファイルの作成:**
    テンプレートファイル `.env.template` をコピーして `.env` という名前の新しいファイルを作成します。このファイルは両方のアプリケーションで使用されますが、設定する変数は実行したいアプリケーションによって異なります。
    ```bash
    cp .env.template .env
    ```

### Idea Discussion セットアップ

`idea-discussion` を実行するために必要な設定です。

1.  **`.env` ファイルの設定:**
    `.env` ファイルを編集し、以下の変数を設定してください。
    - `OPENROUTER_API_KEY`: OpenRouter の API キー (バックエンドで使用)
    - `IDEA_FRONTEND_API_BASE_URL`: フロントエンドがアクセスするバックエンド API の URL（通常は `http://localhost:3000`）

### Policy Edit セットアップ

`policy-edit` を実行するために必要な設定です。

1.  **`.env` ファイルの設定:**
    `.env` ファイルを編集し、以下の変数を設定してください。

    - `OPENROUTER_API_KEY`: OpenRouter の API キー (バックエンドで使用)
    - `GITHUB_APP_ID`: GitHub App の ID (バックエンドで使用)
    - `GITHUB_INSTALLATION_ID`: GitHub App の Installation ID (バックエンドで使用)
    - `GITHUB_TARGET_OWNER`: 対象リポジトリのオーナー名 (バックエンド・フロントエンドで使用)
    - `GITHUB_TARGET_REPO`: 対象リポジトリ名 (バックエンド・フロントエンドで使用)
    - `GITHUB_BASE_BRANCH`: 対象リポジトリのベースブランチ名 (バックエンドで使用)
    - `POLICY_FRONTEND_API_BASE_URL`: フロントエンドがアクセスするバックエンド API の URL（通常は `http://localhost:3001`）

2.  **GitHub App 秘密鍵の配置:**
    `policy-edit` バックエンドが GitHub API と連携するために、GitHub App からダウンロードした秘密鍵ファイル（`.pem`形式）が必要です。
    - `policy/backend/` ディレクトリ内に `secrets` ディレクトリを作成します。
    - ダウンロードした秘密鍵ファイルを `github-key.pem` という名前で `policy/backend/secrets/` ディレクトリ内に配置してください。
    ```bash
    mkdir -p policy/backend/secrets
    cp /path/to/your/downloaded-private-key.pem policy/backend/secrets/github-key.pem
    ```
    _(注意: `/path/to/your/downloaded-private-key.pem` は、ダウンロードした秘密鍵ファイルの実際のパスに置き換えてください。)_

## 開発環境の実行

### 全サービスの起動

すべてのサービスを同時に起動する場合：

```bash
docker-compose up --build -d
```

### Idea Discussion の起動

ルートレベルのフロントエンドと idea-discussion のバックエンド、および MongoDB を起動する場合：

```bash
# 必要なセットアップ: Idea Discussion セットアップ
docker-compose up --build -d frontend idea-backend mongo admin
```

### Policy Edit のみ起動

`policy-edit` のフロントエンド、バックエンド、および PostgreSQL を起動する場合：

```bash
# 必要なセットアップ: Policy Edit セットアップ
docker-compose up --build -d policy-frontend policy-backend postgres-policy
```

### Policy Edit のデータベース migration

`policy-backend` は PostgreSQL を使用します。初回起動時、または `interaction_logs` などのテーブルが存在しないエラーが出る場合は migration を実行してください。

```bash
cd policy/backend
npm install
DATABASE_URL=postgresql://postgres:password@localhost:5433/policy_db npm run db:migrate
cd ../..
docker-compose restart policy-backend
```

migration 後、テーブル作成を以下で確認できます。

```bash
docker-compose exec postgres-policy psql -U postgres -d policy_db -c '\dt'
```

`Failed to log interaction: relation "interaction_logs" does not exist` が出る場合は、上記 migration が完了しているかを確認してください。

## アプリケーションへのアクセス

- **Idea Discussion フロントエンド:** [http://localhost:5173](http://localhost:5173)
- **Policy Edit フロントエンド:** [http://localhost:5174](http://localhost:5174)
- **Policy Edit 管理者ページ:** [http://localhost:5175/](http://localhost:5175/)
  - 管理者作成の設定が必要です。[../vision/admin/README.md](../vision/admin/README.md)

## ログの表示

実行中の全サービスのログを表示するには:

```bash
docker-compose logs -f
```

特定のサービス（例: `policy-backend`）のログを表示するには:

```bash
docker-compose logs -f policy-backend
```

## 環境の停止

実行中のサービスを停止し、コンテナ、ネットワークを削除するには（名前付きボリューム `mongo_data` は保持されます）:

```bash
docker-compose down
```

名前付きボリューム `mongo_data` も含めて削除する（すべてのデータベースデータが削除されます）には:

```bash
docker-compose down -v
```

## 開発ワークフロー

- ローカルのエディタでフロントエンドまたはバックエンドのプロジェクトのコードを編集します。
- 変更は自動的に以下をトリガーするはずです:
  - フロントエンドコンテナ (Vite): Hot Module Replacement (HMR)
  - `idea-backend` コンテナ (`nodemon`): サーバーの再起動
  - (`policy-backend` は `npm start` で実行されるため、通常ホットリロードは行われません。変更を反映するにはコンテナの再起動が必要です: `docker-compose restart policy-backend`)
- HMR が自動的に適用されない場合は、ブラウザをリフレッシュしてフロントエンドの変更を確認してください。
- `package.json` ファイルを変更した場合は、特定のサービスのイメージを再ビルドする必要があるかもしれません:
  ```bash
  # 特定のサービスを再ビルドして再起動
  docker-compose build <service_name> # 例: docker-compose build policy-backend
  docker-compose up -d --no-deps <service_name>
  ```
  または、単に `docker-compose up --build -d` を再度実行します。

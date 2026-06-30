# Idobata プロジェクト - 開発環境構築手順

## 重要なドキュメント

- [プロジェクト概要](./README.md)
- [プロジェクト状況](./project_status.md) (開発者向け)
- [開発環境構築ガイド](./development-setup.md) (開発者向け、本ドキュメント)
- [コントリビューションガイド](./CONTRIBUTING.md) (開発者向け)

このドキュメントでは、**いどばたビジョン**（`vision/`）および**いどばた政策**（`policy/`）アプリケーションの開発環境を Docker Compose を使用してセットアップし、実行する方法について説明します。これらは独立してセットアップ・実行可能です。

> まず手早く動かしたい方は、後述の [クイックスタート（お試し最小構成）](#クイックスタートお試し最小構成) を参照してください。OpenRouter の API キーだけで「いどばたビジョン」を起動できます。

## プロジェクト構成

このプロジェクトは以下のコンポーネントで構成されています：

- **vision/frontend**: いどばたビジョンのユーザー画面（React + TypeScript / Vite）
- **vision/idea-discussion/backend**: いどばたビジョンのバックエンド（Node.js / Express）
- **vision/admin**: いどばたビジョンの管理画面（React + TypeScript）
- **vision/python-service**: 埋め込み生成のための Python サービス
- **policy/frontend**: いどばた政策のフロントエンド（React + TypeScript / Vite）
- **policy/backend**: いどばた政策のバックエンド（Node.js）。GitHub への通信（ファイルのコミットや PR の作成・更新）は、MCP などを介さずバックエンド内で直接実行されます
- **MongoDB**: いどばたビジョンのデータベース
- **PostgreSQL**: いどばた政策のデータベース（対話ログの保存などに使用）

## クイックスタート（お試し最小構成）

「とりあえずクローンして動かしてみたい」場合の最短手順です。**いどばたビジョンは OpenRouter の API キーさえあれば動かせます。**

1.  `.env` を用意する:
    ```bash
    cp .env.template .env
    ```
    最低限、以下の 2 つを設定すれば「いどばたビジョン」は動作します。
    - `OPENROUTER_API_KEY`: [OpenRouter](https://openrouter.ai/) で取得した API キー
    - `JWT_SECRET`: 任意の強いランダム文字列（例: `openssl rand -hex 32` の出力）

2.  いどばたビジョンを起動する:
    ```bash
    docker compose up --build -d frontend idea-backend mongo admin
    ```

3.  管理者ユーザーを作成する（管理画面ログイン用）:
    ```bash
    curl -X POST http://localhost:3000/api/auth/initialize \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@example.com","password":"SecurePassword123","name":"Admin User"}'
    ```

4.  ブラウザで触ってみる:
    - ユーザー画面: [http://localhost:5173](http://localhost:5173)
    - 管理画面: [http://localhost:5175](http://localhost:5175)（上記で作成したアカウントでログイン）

5.  テーマからお題（重要論点）が表示されるまでの流れ:
    1. 管理画面でテーマを作成し、**アクティブ化**する
    2. ユーザー画面でそのテーマにチャットで意見を投稿する
    3. 管理画面の **「重要論点生成」** ボタンを押す（テーマ作成だけでは生成されません）
    4. 生成された重要論点がユーザー画面に表示される
    - より詳しい操作手順は [vision/idea-discussion/README.md](../vision/idea-discussion/README.md) を参照してください。

> **AI チャットが 500 エラーになる場合**：利用する LLM モデルが提供終了している可能性があります。[トラブルシューティング](#トラブルシューティング) の「AI チャットが応答しない」を参照してください。

いどばた政策も含めて試したい場合は、後述の [Policy Edit セットアップ](#policy-edit-セットアップ) の「お試し（モック）構成」を参照してください。GitHub App を用意しなくてもダミー鍵＋モック設定で起動できます。

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
    - `OPENROUTER_API_KEY`: OpenRouter の API キー (バックエンドで使用、**必須**)
    - `JWT_SECRET`: 管理画面の認証に使う秘密鍵（**必須**。例: `openssl rand -hex 32`）
    - `IDEA_FRONTEND_API_BASE_URL`: フロントエンドがアクセスするバックエンド API の URL（通常は `http://localhost:3000`）

    > `.env.template` には `GITHUB_*` などの変数も含まれますが、**いどばたビジョン単体では GitHub 関連の設定は不要**です（docker-compose では渡していますが idea-backend は使用しません）。

2.  **使用する LLM モデルについて:**
    AI チャットや論点抽出に使う LLM モデルは、現状 `vision/idea-discussion/backend/services/llmService.js` の中で `google/gemini-2.0-flash-001` がデフォルトとしてハードコードされています。OpenRouter 側でこのモデルが提供終了している場合は `404 No endpoints found` となり AI 機能が動かないため、その際は同ファイルのモデル ID を OpenRouter で利用可能な現行モデルに変更してください。

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
    - `VITE_USE_MOCK_GITHUB_CLIENT`: `true` にするとフロントエンドが実際の GitHub API を呼ばずモッククライアントを使用します。お試し時は `true` を推奨します。

> ### お試し（モック）構成 — GitHub App なしで起動する
>
> いどばた政策は本来 GitHub App と連携しますが、UI を確認するだけならモック構成で起動できます。
>
> 1.  `.env` で `VITE_USE_MOCK_GITHUB_CLIENT=true` を設定します。
> 2.  ビルド時に秘密鍵ファイルが必須（後述の Dockerfile で `COPY` される）なため、**ダミーの鍵**を配置してビルドを通します。
>     ```bash
>     mkdir -p policy/backend/secrets
>     openssl genrsa -out policy/backend/secrets/github-key.pem 2048
>     ```
> 3.  通常どおり `docker compose up --build -d policy-frontend policy-backend postgres-policy` で起動します。
>
> この構成では実際の GitHub への書き込み（コミットや PR 作成）は行えませんが、画面表示や AI チャットの動作確認が可能です。実運用では下記の手順で本物の GitHub App 秘密鍵を配置してください。

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
docker compose up --build -d
```

### Idea Discussion の起動

ルートレベルのフロントエンドと idea-discussion のバックエンド、および MongoDB を起動する場合：

```bash
# 必要なセットアップ: Idea Discussion セットアップ
docker compose up --build -d frontend idea-backend mongo admin
```

### Policy Edit のみ起動

`policy-edit` のフロントエンド、バックエンド、および PostgreSQL を起動する場合：

```bash
# 必要なセットアップ: Policy Edit セットアップ
docker compose up --build -d policy-frontend policy-backend postgres-policy
```

### Policy Edit のデータベース migration

`policy-backend` は PostgreSQL を使用します。初回起動時、または `interaction_logs` などのテーブルが存在しないエラーが出る場合は migration を実行してください。

```bash
cd policy/backend
npm install
DATABASE_URL=postgresql://postgres:password@localhost:5433/policy_db npm run db:migrate
cd ../..
docker compose restart policy-backend
```

migration 後、テーブル作成を以下で確認できます。

```bash
docker compose exec postgres-policy psql -U postgres -d policy_db -c '\dt'
```

`Failed to log interaction: relation "interaction_logs" does not exist` が出る場合は、上記 migration が完了しているかを確認してください。

## アプリケーションへのアクセス

- **Idea Discussion フロントエンド:** [http://localhost:5173](http://localhost:5173)
- **Policy Edit フロントエンド:** [http://localhost:5174](http://localhost:5174)
- **Policy Edit 管理者ページ:** [http://localhost:5175/](http://localhost:5175/)
  - 管理者作成の設定が必要です。[../vision/admin/README.md](../vision/admin/README.md)

## トラブルシューティング

- **AI チャットが応答しない / 500 エラーになる**
  利用中の LLM モデルが OpenRouter で提供終了していると `404 No endpoints found` となり、チャットや論点抽出など AI 機能全体が失敗します。`vision/idea-discussion/backend/services/llmService.js` のモデル ID を、OpenRouter で現在利用可能なモデルに変更してください。
- **`policy-backend` のイメージビルドが失敗する**
  `policy/backend/Dockerfile` がビルド時に `policy/backend/secrets/github-key.pem` を要求します。鍵が無いとビルドが止まるため、お試し時は上記「お試し（モック）構成」のダミー鍵を配置してください。
- **`postgres-policy` が起動しない / `interaction_logs` のエラーが出る**
  `Failed to log interaction: relation "interaction_logs" does not exist` が出る場合は、下記の「Policy Edit のデータベース migration」を実行してください。なお対話ログ保存は失敗してもチャット応答自体は返る設計です。

## ログの表示

実行中の全サービスのログを表示するには:

```bash
docker compose logs -f
```

特定のサービス（例: `policy-backend`）のログを表示するには:

```bash
docker compose logs -f policy-backend
```

## 環境の停止

実行中のサービスを停止し、コンテナ、ネットワークを削除するには（名前付きボリューム `mongo_data` は保持されます）:

```bash
docker compose down
```

名前付きボリューム `mongo_data` も含めて削除する（すべてのデータベースデータが削除されます）には:

```bash
docker compose down -v
```

## 開発ワークフロー

- ローカルのエディタでフロントエンドまたはバックエンドのプロジェクトのコードを編集します。
- 変更は自動的に以下をトリガーするはずです:
  - フロントエンドコンテナ (Vite): Hot Module Replacement (HMR)
  - `idea-backend` コンテナ (`nodemon`): サーバーの再起動
  - (`policy-backend` は `npm start` で実行されるため、通常ホットリロードは行われません。変更を反映するにはコンテナの再起動が必要です: `docker compose restart policy-backend`)
- HMR が自動的に適用されない場合は、ブラウザをリフレッシュしてフロントエンドの変更を確認してください。
- `package.json` ファイルを変更した場合は、特定のサービスのイメージを再ビルドする必要があるかもしれません:
  ```bash
  # 特定のサービスを再ビルドして再起動
  docker compose build <service_name> # 例: docker compose build policy-backend
  docker compose up -d --no-deps <service_name>
  ```
  または、単に `docker compose up --build -d` を再度実行します。

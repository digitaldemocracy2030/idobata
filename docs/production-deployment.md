# idobata 本番環境デプロイガイド

このドキュメントでは、idobataアプリケーションを本番環境にデプロイする方法について説明します。

## 目次

1. [前提条件](#前提条件)
2. [インフラストラクチャ要件](#インフラストラクチャ要件)
3. [デプロイ手順](#デプロイ手順)
4. [環境変数の設定](#環境変数の設定)
5. [SSL証明書の設定](#ssl証明書の設定)
6. [バックアップと復元](#バックアップと復元)
7. [モニタリングとログ](#モニタリングとログ)
8. [トラブルシューティング](#トラブルシューティング)
9. [セキュリティに関する考慮事項](#セキュリティに関する考慮事項)

## 前提条件

本番環境へのデプロイには以下のソフトウェアが必要です：

- Docker (バージョン20.10以上)
- Docker Compose (バージョン2.0以上)
- Git
- Node.js (開発環境のみ、バージョン20以上)

## インフラストラクチャ要件

推奨される最小システム要件：

- CPU: 4コア以上
- メモリ: 8GB以上
- ストレージ: 50GB以上（SSD推奨）
- ネットワーク: 安定したインターネット接続、固定IPアドレス

クラウドプロバイダー（AWS、GCP、Azureなど）または自社サーバーにデプロイ可能です。

## デプロイ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/digitaldemocracy2030/idobata.git
cd idobata
```

### 2. 環境変数の設定

`.env.production.template`ファイルを`.env.production`にコピーし、必要な値を設定します：

```bash
cp .env.production.template .env.production
# .env.production を編集して必要な値を設定
```

詳細は[環境変数の設定](#環境変数の設定)セクションを参照してください。

### 3. SSL証明書の設定

本番環境ではSSL証明書が必要です。Let's Encryptを使用するか、既存の証明書を使用できます：

```bash
# Let's Encrypt証明書の取得手順を表示
./scripts/ssl-setup.sh

# または自己署名証明書を生成（テスト用）
./scripts/ssl-setup.sh --self-signed
```

詳細は[SSL証明書の設定](#ssl証明書の設定)セクションを参照してください。

### 4. デプロイの実行

デプロイスクリプトを実行して本番環境をデプロイします：

```bash
./scripts/deploy.sh
```

このスクリプトは以下の処理を行います：
- 環境変数と SSL 証明書の確認
- Nginx設定ファイルの更新
- Docker Composeを使用した本番環境のビルドと起動

### 5. デプロイの確認

ブラウザで`https://your_production_domain.com`にアクセスし、アプリケーションが正常に動作していることを確認します。

## 環境変数の設定

`.env.production`ファイルには以下の重要な環境変数を設定する必要があります：

### 基本設定

- `NODE_ENV`: 必ず`production`に設定
- `PRODUCTION_DOMAIN`: 本番環境のドメイン名

### セキュリティ設定

- `JWT_SECRET`: JWT認証用のシークレットキー（強力なランダム文字列を使用）
- `JWT_EXPIRES_IN`: JWTトークンの有効期限

### データベース認証情報

- `MONGO_ROOT_USERNAME`: MongoDB管理者ユーザー名
- `MONGO_ROOT_PASSWORD`: MongoDB管理者パスワード
- `MONGODB_URI`: MongoDB接続URI

- `POSTGRES_USER`: PostgreSQLユーザー名
- `POSTGRES_PASSWORD`: PostgreSQLパスワード
- `POSTGRES_DB`: PostgreSQLデータベース名
- `DATABASE_URL`: PostgreSQL接続URI

### API キー

- `OPENROUTER_API_KEY`: OpenRouter API Key (LLM連携用)
- `OPENAI_API_KEY`: OpenAI API Key (Python Embedding Service用)

### GitHub 連携設定

- `GITHUB_APP_ID`: GitHub App ID
- `GITHUB_INSTALLATION_ID`: GitHub App Installation ID
- `GITHUB_TARGET_OWNER`: 対象リポジトリのオーナー名
- `GITHUB_TARGET_REPO`: 対象リポジトリ名
- `GITHUB_BASE_BRANCH`: ベースブランチ名

### CORS設定

- `IDEA_CORS_ORIGIN`: idea-backendのCORS設定
- `POLICY_CORS_ORIGIN`: policy-backendのCORS設定

### フロントエンド設定

- `IDEA_FRONTEND_API_BASE_URL`: idea-backendのAPI URL
- `POLICY_FRONTEND_API_BASE_URL`: policy-backendのAPI URL
- `ADMIN_API_BASE_URL`: 管理画面用のAPI URL

- `VITE_FRONTEND_ALLOWED_HOSTS`: フロントエンドの許可ホスト
- `VITE_POLICY_FRONTEND_ALLOWED_HOSTS`: ポリシーフロントエンドの許可ホスト
- `VITE_ADMIN_FRONTEND_ALLOWED_HOSTS`: 管理画面の許可ホスト

## SSL証明書の設定

本番環境では、セキュアな接続のためにSSL証明書が必要です。以下の方法で証明書を取得・設定できます：

### Let's Encrypt証明書（推奨）

Let's Encryptを使用して無料のSSL証明書を取得します：

1. certbotをインストール：
   ```bash
   sudo apt-get update
   sudo apt-get install certbot
   ```

2. 証明書を取得：
   ```bash
   sudo certbot certonly --standalone -d your_production_domain.com -d www.your_production_domain.com
   ```

3. 取得した証明書をSSLディレクトリにコピー：
   ```bash
   sudo mkdir -p ./ssl
   sudo cp /etc/letsencrypt/live/your_production_domain.com/fullchain.pem ./ssl/
   sudo cp /etc/letsencrypt/live/your_production_domain.com/privkey.pem ./ssl/
   sudo chown $(whoami):$(whoami) ./ssl/*.pem
   ```

### 自己署名証明書（テスト用）

テスト環境では、自己署名証明書を使用できます：

```bash
./scripts/ssl-setup.sh --self-signed
```

**注意**: 自己署名証明書は本番環境では使用しないでください。ブラウザに警告が表示され、ユーザーエクスペリエンスが低下します。

### 既存の証明書の使用

既存のSSL証明書がある場合は、以下のファイルを`./ssl/`ディレクトリに配置します：

- `fullchain.pem`: 証明書チェーン
- `privkey.pem`: 秘密鍵

## バックアップと復元

### データベースのバックアップ

定期的なバックアップを実行するには、バックアップスクリプトを使用します：

```bash
./scripts/backup.sh
```

このスクリプトは以下のデータをバックアップします：
- MongoDBデータ（idea-discussion）
- PostgreSQLデータ（policy-edit）

バックアップファイルは`./backups/`ディレクトリに保存されます。

### バックアップの自動化

cronを使用して定期的なバックアップを設定することをお勧めします：

```bash
# 毎日午前3時にバックアップを実行
0 3 * * * /path/to/idobata/scripts/backup.sh
```

### バックアップからの復元

MongoDBの復元：

```bash
# バックアップファイルを解凍
tar -xzf backups/YYYYMMDD_HHMMSS.tar.gz

# MongoDBデータの復元
docker-compose -f docker-compose.prod.yml exec -T mongo \
  mongorestore --host localhost --port 27017 \
  --username admin --password your_password --authenticationDatabase admin \
  --db idea_discussion_db /path/to/extracted/backup/mongodb/idea_discussion_db
```

PostgreSQLの復元：

```bash
# PostgreSQLデータの復元
cat /path/to/extracted/backup/postgres_policy.sql | \
  docker-compose -f docker-compose.prod.yml exec -T postgres-policy \
  psql -U postgres -d policy_db
```

## モニタリングとログ

### ログの確認

各サービスのログを確認するには：

```bash
# すべてのサービスのログを表示
docker-compose -f docker-compose.prod.yml logs

# 特定のサービスのログを表示（例：idea-backend）
docker-compose -f docker-compose.prod.yml logs idea-backend

# リアルタイムでログを追跡
docker-compose -f docker-compose.prod.yml logs -f
```

### モニタリングの設定

本番環境では、以下のモニタリングツールの使用を検討してください：

- Prometheus + Grafana: メトリクス収集と可視化
- ELK Stack (Elasticsearch, Logstash, Kibana): ログ管理
- Uptime Robot / Pingdom: 外部からの可用性モニタリング

## トラブルシューティング

### 一般的な問題と解決策

#### アプリケーションにアクセスできない

1. Nginxが実行中か確認：
   ```bash
   docker-compose -f docker-compose.prod.yml ps nginx
   ```

2. Nginxのログを確認：
   ```bash
   docker-compose -f docker-compose.prod.yml logs nginx
   ```

3. ドメインのDNS設定を確認

#### データベース接続エラー

1. データベースコンテナが実行中か確認：
   ```bash
   docker-compose -f docker-compose.prod.yml ps mongo postgres-policy
   ```

2. データベースログを確認：
   ```bash
   docker-compose -f docker-compose.prod.yml logs mongo
   docker-compose -f docker-compose.prod.yml logs postgres-policy
   ```

3. 環境変数の接続情報が正しいか確認

#### SSL証明書エラー

1. 証明書ファイルが正しい場所にあるか確認：
   ```bash
   ls -la ./ssl/
   ```

2. 証明書の権限を確認：
   ```bash
   chmod 644 ./ssl/*.pem
   ```

3. Nginxの設定で証明書のパスが正しいか確認

### サービスの再起動

特定のサービスを再起動するには：

```bash
docker-compose -f docker-compose.prod.yml restart service_name
```

すべてのサービスを再起動するには：

```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## セキュリティに関する考慮事項

### 環境変数の保護

- `.env.production`ファイルを安全に管理し、Gitにコミットしないでください
- 本番環境のシークレットキーは強力なランダム文字列を使用してください
- 定期的にシークレットキーをローテーションしてください

### ファイアウォール設定

本番サーバーでは、必要なポートのみを開放してください：

- 80/TCP (HTTP)
- 443/TCP (HTTPS)

その他のポートは外部からアクセスできないようにしてください。

### 定期的なアップデート

セキュリティを維持するために、定期的に以下をアップデートしてください：

- Dockerイメージ
- Nginxの設定
- SSL証明書
- アプリケーションコード

### データバックアップ

重要なデータを保護するために：

- 定期的なバックアップを実行
- バックアップを安全な場所に保存
- 定期的にバックアップからの復元テストを実施

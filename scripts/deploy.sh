#!/bin/bash
set -e


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
  echo "エラー: .env.production ファイルが見つかりません。"
  echo ".env.production.template をコピーして必要な値を設定してください。"
  exit 1
fi

source "$PROJECT_ROOT/.env.production"
if [ -z "$PRODUCTION_DOMAIN" ]; then
  echo "エラー: PRODUCTION_DOMAIN が .env.production で設定されていません。"
  exit 1
fi

SSL_DIR="$PROJECT_ROOT/ssl"
if [ ! -f "$SSL_DIR/fullchain.pem" ] || [ ! -f "$SSL_DIR/privkey.pem" ]; then
  echo "警告: SSL証明書が見つかりません。"
  echo "SSL証明書を $SSL_DIR ディレクトリに配置するか、ssl-setup.sh スクリプトを実行してください。"
  
  read -p "SSL証明書なしで続行しますか？ (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "Nginxの設定ファイルを更新しています..."
sed -i "s/your_production_domain.com/$PRODUCTION_DOMAIN/g" "$PROJECT_ROOT/nginx.prod.conf"

echo "Docker Composeで本番環境をビルド・起動しています..."
cd "$PROJECT_ROOT"
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

echo "デプロイが完了しました！"
echo "アプリケーションは https://$PRODUCTION_DOMAIN でアクセスできます。"

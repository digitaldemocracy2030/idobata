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
mkdir -p "$SSL_DIR"

if [ "$1" == "--self-signed" ]; then
  echo "自己署名SSL証明書を生成しています..."
  
  if ! command -v openssl &> /dev/null; then
    echo "エラー: OpenSSLがインストールされていません。"
    exit 1
  fi
  
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "$SSL_DIR/privkey.pem" \
    -out "$SSL_DIR/fullchain.pem" \
    -subj "/CN=$PRODUCTION_DOMAIN" \
    -addext "subjectAltName=DNS:$PRODUCTION_DOMAIN,DNS:www.$PRODUCTION_DOMAIN"
  
  echo "自己署名SSL証明書が生成されました。"
  echo "注意: 本番環境では信頼された証明書を使用することをお勧めします。"
else
  echo "Let's Encrypt証明書の取得手順:"
  echo "1. certbotをインストールします:"
  echo "   sudo apt-get update"
  echo "   sudo apt-get install certbot"
  echo ""
  echo "2. 証明書を取得します:"
  echo "   sudo certbot certonly --standalone -d $PRODUCTION_DOMAIN -d www.$PRODUCTION_DOMAIN"
  echo ""
  echo "3. 取得した証明書をSSLディレクトリにコピーします:"
  echo "   sudo cp /etc/letsencrypt/live/$PRODUCTION_DOMAIN/fullchain.pem $SSL_DIR/"
  echo "   sudo cp /etc/letsencrypt/live/$PRODUCTION_DOMAIN/privkey.pem $SSL_DIR/"
  echo ""
  echo "4. 証明書の権限を設定します:"
  echo "   sudo chown $(whoami):$(whoami) $SSL_DIR/*.pem"
  echo ""
  echo "または、--self-signedオプションを指定して自己署名証明書を生成することもできます:"
  echo "   ./scripts/ssl-setup.sh --self-signed"
fi

#!/bin/bash
set -e


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

if [ ! -f "$PROJECT_ROOT/.env.production" ]; then
  echo "エラー: .env.production ファイルが見つかりません。"
  exit 1
fi

source "$PROJECT_ROOT/.env.production"

BACKUP_DIR="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "データベースのバックアップを作成しています..."

echo "MongoDBのバックアップを作成しています..."
docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" exec -T mongo \
  mongodump --host localhost --port 27017 \
  --username "$MONGO_ROOT_USERNAME" --password "$MONGO_ROOT_PASSWORD" \
  --authenticationDatabase admin \
  --db idea_discussion_db --out /tmp/backup

docker cp $(docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" ps -q mongo):/tmp/backup "$BACKUP_DIR/mongodb"

echo "PostgreSQLのバックアップを作成しています..."
docker-compose -f "$PROJECT_ROOT/docker-compose.prod.yml" exec -T postgres-policy \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "$BACKUP_DIR/postgres_policy.sql"

echo "バックアップを圧縮しています..."
tar -czf "$BACKUP_DIR.tar.gz" -C "$(dirname "$BACKUP_DIR")" "$(basename "$BACKUP_DIR")"
rm -rf "$BACKUP_DIR"

echo "バックアップが完了しました: $BACKUP_DIR.tar.gz"

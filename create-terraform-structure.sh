#!/bin/bash

# Terraform プロジェクトのディレクトリ構成を作成するスクリプト

echo "Creating Terraform directory structure..."

# メインディレクトリ
mkdir -p terraform

cd terraform

# modules ディレクトリ
mkdir -p modules/cloud-run
mkdir -p modules/storage
mkdir -p modules/iam

# modules/cloud-run のファイル
touch modules/cloud-run/main.tf
touch modules/cloud-run/variables.tf
touch modules/cloud-run/outputs.tf
touch modules/cloud-run/versions.tf

# modules/storage のファイル
touch modules/storage/main.tf
touch modules/storage/variables.tf
touch modules/storage/outputs.tf

# modules/iam のファイル
touch modules/iam/main.tf
touch modules/iam/variables.tf
touch modules/iam/outputs.tf

# environments ディレクトリ
mkdir -p environments/stg
mkdir -p environments/prod

# environments/stg のファイル
touch environments/stg/main.tf
touch environments/stg/variables.tf
touch environments/stg/outputs.tf
touch environments/stg/terraform.tfvars
touch environments/stg/backend.tf
touch environments/stg/versions.tf

# environments/prod のファイル
touch environments/prod/main.tf
touch environments/prod/variables.tf
touch environments/prod/outputs.tf
touch environments/prod/terraform.tfvars
touch environments/prod/backend.tf
touch environments/prod/versions.tf

# shared ディレクトリ
mkdir -p shared/secrets
mkdir -p shared/monitoring

# shared/secrets のファイル
touch shared/secrets/main.tf
touch shared/secrets/variables.tf

# shared/monitoring のファイル
touch shared/monitoring/main.tf
touch shared/monitoring/variables.tf

# scripts ディレクトリ
mkdir -p scripts
touch scripts/init.sh
touch scripts/plan.sh
touch scripts/apply.sh

# スクリプトに実行権限を付与
chmod +x scripts/*.sh

# GitHub Actions ディレクトリ
mkdir -p .github/workflows
touch .github/workflows/terraform-plan.yml
touch .github/workflows/terraform-apply.yml

# ルートレベルのファイル
touch README.md
touch .gitignore
touch .terraform-version

echo "Directory structure created successfully!"

# ディレクトリツリーを表示（treeコマンドがある場合）
if command -v tree &> /dev/null; then
    echo -e "\nCreated structure:"
    tree -a
else
    echo -e "\nCreated structure:"
    find . -type f -o -type d | sort
fi
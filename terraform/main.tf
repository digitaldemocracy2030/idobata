# terraform/main.tf
# このファイルは主に開発/テスト用途で使用されます
# 本番環境では environments/prod/main.tf を使用してください

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ローカル開発用の最小構成例
# 必要なサービスのみを起動してコストを削減

# 開発用のChromaDBストレージ
module "chromadb_storage_dev" {
  source = "./modules/storage"
  
  bucket_name   = "${var.project_id}-chromadb-dev"
  location      = var.region
  force_destroy = true  # 開発環境なので削除可能
  versioning    = false # 開発環境ではバージョニング不要
  lifecycle_age = 7     # 7日で自動削除
}

# 開発用APIサービスのみ起動
module "api_service_dev" {
  source = "./modules/cloud_run"
  
  service_name          = "api-dev"
  region               = var.region
  image                = "gcr.io/${var.project_id}/api:latest"
  cpu                  = "1"
  memory               = "512Mi"
  max_instances        = 2
  min_instances        = 0  # コスト削減のため0から開始
  allow_unauthenticated = true
  mongodb_uri          = var.mongodb_uri
  
  env_vars = {
    NODE_ENV = "development"
    DEBUG    = "true"
  }
}

# 開発用LLMサービス
module "llm_service_dev" {
  source = "./modules/cloud_run"
  
  service_name          = "llm-python-dev"
  region               = var.region
  image                = "gcr.io/${var.project_id}/llm-python:latest"
  cpu                  = "2"
  memory               = "4Gi"
  max_instances        = 1
  min_instances        = 0
  allow_unauthenticated = false
  mongodb_uri          = var.mongodb_uri
  enable_chromadb      = true
  chromadb_bucket      = module.chromadb_storage_dev.bucket_name
  
  env_vars = {
    PYTHON_ENV = "development"
    DEBUG      = "true"
  }
}

# 出力
output "api_url" {
  value = module.api_service_dev.url
  description = "開発用APIのURL"
}

output "llm_service_url" {
  value = module.llm_service_dev.url
  description = "開発用LLMサービスのURL"
}

output "chromadb_bucket" {
  value = module.chromadb_storage_dev.bucket_name
  description = "開発用ChromaDBバケット名"
}
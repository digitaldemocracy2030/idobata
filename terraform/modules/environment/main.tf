# Provider設定
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# ローカル変数
locals {
  # 環境判定
  is_prod = var.environment == "prod"
  
  # 共通ラベル
  common_labels = {
    environment = var.environment
    managed_by  = "terraform"
    team        = var.team_name
  }
  
  # サービス名の定義
  services = {
    admin  = "${var.environment}-admin-service"
    user   = "${var.environment}-user-service"
    api    = "${var.environment}-api-service"
    python = "${var.environment}-python-service"
  }

  service_account_emails = {
    admin  = "${local.services.admin}-sa@${var.project_id}.iam.gserviceaccount.com"
    user   = "${local.services.user}-sa@${var.project_id}.iam.gserviceaccount.com"
    api    = "${local.services.api}-sa@${var.project_id}.iam.gserviceaccount.com"
    python = "${local.services.python}-sa@${var.project_id}.iam.gserviceaccount.com"
  }

  # 環境別のドメイン設定
  domains = {
    admin = local.is_prod ? "admin.daikibo-jyukugi-cdp.jp" : "${var.environment}.admin.daikibo-jyukugi-cdp.jp"
    user  = local.is_prod ? "daikibo-jyukugi-cdp.jp" : "${var.environment}.daikibo-jyukugi-cdp.jp"
    api   = local.is_prod ? "api.daikibo-jyukugi-cdp.jp" : "${var.environment}.api.daikibo-jyukugi-cdp.jp"
  }
  # Artifact Registryのリポジトリ名
  repository_id = "${var.environment}-idobata-repo"
}

# Artifact Registry（コンテナイメージ用）- 既存がない場合のみ作成
resource "google_artifact_registry_repository" "containers" {
  count = var.create_artifact_registry ? 1 : 0

  location      = var.region
  repository_id = local.repository_id
  description   = "Container images for ${var.environment} environment"
  format        = "DOCKER"
  
  labels = local.common_labels
}

# Cloud Storage（ChromaDB用）
resource "google_storage_bucket" "chromadb" {
  name          = "${var.project_id}-${var.environment}-chromadb"
  location      = var.region
  force_destroy = !local.is_prod # prod以外は強制削除可能
  
  uniform_bucket_level_access = true
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
  
  labels = local.common_labels
}

# サービスアカウント
resource "google_service_account" "services" {
  for_each = local.services
  
  account_id   = "${each.value}-sa"
  display_name = "Service Account for ${each.value}"
  description  = "Service account for Cloud Run service ${each.value}"
}

# Cloud Run サービス - Admin
module "admin_service" {
  source = "../cloud-run"
  
  service_name = local.services.admin
  location     = var.region
  image        = "${var.region}-docker.pkg.dev/${var.project_id}/${local.repository_id}/admin:${var.admin_image_tag}"
  
  service_account = google_service_account.services["admin"].email
  
  env_vars = merge(var.admin_env_vars, {
    ENVIRONMENT = var.environment
    API_URL     = "http://${local.services.api}"
  })
  
  min_instances = var.admin_min_instances
  max_instances = var.admin_max_instances
  
  labels = local.common_labels
}

# ドメインマッピング - Admin
resource "google_cloud_run_domain_mapping" "admin" {
  count    = var.enable_domain_mapping ? 1 : 0
  location = var.region
  name     = local.domains.admin

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = module.admin_service.service_name
  }
}

# Cloud Run サービス - User
module "user_service" {
  source = "../cloud-run"
  
  service_name = local.services.user
  location     = var.region
  image        = "${var.region}-docker.pkg.dev/${var.project_id}/${local.repository_id}/user:${var.user_image_tag}"
  
  service_account = google_service_account.services["user"].email
  
  env_vars = merge(var.user_env_vars, {
    ENVIRONMENT = var.environment
    API_URL     = "http://${local.services.api}"
  })
  
  min_instances = var.user_min_instances
  max_instances = var.user_max_instances
  
  labels = local.common_labels
}

# ドメインマッピング - User
resource "google_cloud_run_domain_mapping" "user" {
  count    = var.enable_domain_mapping ? 1 : 0
  location = var.region
  name     = local.domains.user

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = module.user_service.service_name
  }
}

# Cloud Run サービス - API
module "api_service" {
  source = "../cloud-run"
  
  service_name = local.services.api
  location     = var.region
  image        = "${var.region}-docker.pkg.dev/${var.project_id}/${local.repository_id}/api:${var.api_image_tag}"
  
  service_account = google_service_account.services["api"].email
  
  env_vars = merge(var.api_env_vars, {
    NODE_ENV           = local.is_prod ? "production" : "development"
    ENVIRONMENT        = var.environment
    PYTHON_SERVICE_URL = "http://${local.services.python}"
  })
  
  min_instances = var.api_min_instances
  max_instances = var.api_max_instances
  
  labels = local.common_labels
}

# ドメインマッピング - API
resource "google_cloud_run_domain_mapping" "api" {
  count    = var.enable_domain_mapping ? 1 : 0
  location = var.region
  name     = local.domains.api

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = module.api_service.service_name
  }
}

# Cloud Run サービス - Python (LLM)
module "python_service" {
  source = "../cloud-run"
  
  service_name = local.services.python
  location     = var.region
  image        = "${var.region}-docker.pkg.dev/${var.project_id}/${local.repository_id}/python-service:${var.python_image_tag}"
  
  service_account = google_service_account.services["python"].email
  
  env_vars = merge(var.python_env_vars, {
    ENVIRONMENT        = var.environment
    CHROMA_BUCKET_NAME = google_storage_bucket.chromadb.name
    USE_CLOUD_STORAGE  = "true"
    API_URL           = "http://${local.services.api}"
  })
  
  # Python サービスは メモリとCPUを多めに
  memory = var.python_memory
  cpu    = var.python_cpu
  
  min_instances = var.python_min_instances
  max_instances = var.python_max_instances
  
  labels = local.common_labels
}

# IAM設定 - Storage アクセス
resource "google_storage_bucket_iam_member" "chromadb_access" {
  bucket = google_storage_bucket.chromadb.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.services["python"].email}"
}

# IAM設定 - サービス間通信
resource "google_cloud_run_service_iam_member" "api_invoker" {
  for_each = toset([
    local.service_account_emails["admin"],
    local.service_account_emails["user"]
  ])
  
  service  = module.api_service.service_name
  location = var.region
  role     = "roles/run.invoker"
  member   = "serviceAccount:${each.value}"
}

resource "google_cloud_run_service_iam_member" "python_invoker" {
  service  = module.python_service.service_name
  location = var.region
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.services["api"].email}"
}

# Public access settings
resource "google_cloud_run_service_iam_member" "public_access" {
  for_each = var.public_services
  
  service  = local.services[each.key]
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
  
  depends_on = [
    module.admin_service,
    module.user_service,
    module.api_service,
    module.python_service
  ]
}

# Admin サービスは特定ユーザーのみアクセス可能
# resource "google_cloud_run_service_iam_member" "admin_access" {
#   service  = module.admin_service.service_name
#   location = var.region
#   role     = "roles/run.invoker"
#   member = "user:foino74@gmail.com"
# }
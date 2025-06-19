# environments/stg/main.tf
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
  env = "stg"
  
  # 共通ラベル
  common_labels = {
    environment = local.env
    managed_by  = "terraform"
    team        = var.team_name
  }
  
  # サービス名の定義
  services = {
    admin  = "${local.env}-admin-service"
    user   = "${local.env}-user-service"
    api    = "${local.env}-api-service"
    python = "${local.env}-python-service"
  }

  service_account_emails = {
    admin  = "${local.services.admin}-sa@${var.project_id}.iam.gserviceaccount.com"
    user   = "${local.services.user}-sa@${var.project_id}.iam.gserviceaccount.com"
    api    = "${local.services.api}-sa@${var.project_id}.iam.gserviceaccount.com"
    python = "${local.services.python}-sa@${var.project_id}.iam.gserviceaccount.com"
  }

}

# Artifact Registry（コンテナイメージ用）
resource "google_artifact_registry_repository" "containers" {
  location      = var.region
  repository_id = "${local.env}-idobata-repo"
  description   = "Container images for staging environment"
  format        = "DOCKER"
  
  labels = local.common_labels
}

# Cloud Storage（ChromaDB用）
resource "google_storage_bucket" "chromadb" {
  name          = "${var.project_id}-${local.env}-chromadb"
  location      = var.region
  force_destroy = local.env != "prod" # prod以外は強制削除可能
  
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
  source = "../../modules/cloud-run"
  
  service_name = local.services.admin
  location     = var.region

  # 今の手作業は
  image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.containers.repository_id}/admin:${var.admin_image_tag}"
  
  service_account = google_service_account.services["admin"].email
  
  env_vars = {
    ENVIRONMENT = local.env
    API_URL     = "http://${local.services.api}" 
    # API_URL     = module.api_service.service_url 
    VITE_ADMIN_FRONTEND_ALLOWED_HOSTS = var.admin_frontend_allowed_hosts
  }
  
  
  min_instances = var.admin_min_instances
  max_instances = var.admin_max_instances
  
  labels = local.common_labels
}

# ドメインマッピング - Admin
resource "google_cloud_run_domain_mapping" "admin" {
  location = var.region
  name     = "${local.env}.admin.daikibo-jyukugi-cdp.jp"

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = module.admin_service.service_name
  }
}


# Cloud Run サービス - User
module "user_service" {
  source = "../../modules/cloud-run"
  
  service_name = local.services.user
  location     = var.region
  
  image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.containers.repository_id}/user:${var.user_image_tag}"
  
  service_account = google_service_account.services["user"].email
  
  env_vars = {
    ENVIRONMENT = local.env
    API_URL     = "http://${local.services.api}" 
    VITE_FRONTEND_ALLOWED_HOSTS = var.vite_frontend_allowed_hosts
  }
  
  min_instances = var.user_min_instances
  max_instances = var.user_max_instances
  
  labels = local.common_labels
}

# ドメインマッピング - User
resource "google_cloud_run_domain_mapping" "user" {
  location = var.region
  name     = "${local.env}.daikibo-jyukugi-cdp.jp"

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = module.user_service.service_name
  }
}

# Cloud Run サービス - API
module "api_service" {
  source = "../../modules/cloud-run"
  
  service_name = local.services.api
  location     = var.region
  
  image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.containers.repository_id}/api:${var.api_image_tag}"
  
  service_account = google_service_account.services["api"].email
  
  env_vars = {
    NODE_ENV           = "development"  # stg環境なので
    ENVIRONMENT        = local.env
    PYTHON_SERVICE_URL = "http://${local.services.python}"
    MONGODB_URI        = var.mongodb_uri
    API_BASE_URL       = var.api_base_url
    PASSWORD_PEPPER    = var.password_pepper
    OPENROUTER_API_KEY = var.openrouter_api_key
    IDEA_CORS_ORIGIN   = var.idea_cors_origin
    JWT_SECRET         = var.jwt_secret
    JWT_EXPIRES_IN     = "1d"
    ALLOW_DELETE_THEME = var.allow_delete_theme
  }
  
  min_instances = var.api_min_instances
  max_instances = var.api_max_instances
  
  labels = local.common_labels
}


# ドメインマッピング - API
resource "google_cloud_run_domain_mapping" "api" {
  location = var.region
  name     = "${local.env}.api.daikibo-jyukugi-cdp.jp"

  metadata {
    namespace = var.project_id
  }

  spec {
    route_name = module.api_service.service_name
  }
}

# Cloud Run サービス - Python (LLM)
module "python_service" {
  source = "../../modules/cloud-run"
  
  service_name = local.services.python
  location     = var.region
  
  image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.containers.repository_id}/python-service:${var.python_image_tag}"
  
  service_account = google_service_account.services["python"].email
  
  env_vars = {
    ENVIRONMENT     = local.env
    CHROMA_BUCKET_NAME = google_storage_bucket.chromadb.name
    USE_CLOUD_STORAGE  = "true"
    API_URL           = "http://${local.services.api}" # terraform.tfvars で設定
    OPENAI_API_KEY    = var.openai_api_key  # 環境変数として直接設定  }
  }
  
  # Python サービスは メモリとCPUを多めに
  memory = "2Gi"
  cpu    = "2"
  
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

# User サービスは常に公開
resource "google_cloud_run_service_iam_member" "user_public_access" {
  service  = module.user_service.service_name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}


# Admin サービスは常に公開
resource "google_cloud_run_service_iam_member" "admin_public_access" {
  service  = module.admin_service.service_name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# API サービスは常に公開
resource "google_cloud_run_service_iam_member" "api_public_access" {
  service  = module.api_service.service_name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}


# Identity-Aware Proxyの設定
# resource "google_iap_web_iam_member" "admin_access" {
#   role   = "roles/iap.httpsResourceAccessor"
#   member = "user:foino74@gmail.com"
# }


# User サービスは特定ユーザーのみアクセス可能
# resource "google_cloud_run_service_iam_member" "user_public_access" {
#   service  = module.user_service.service_name
#   location = var.region
#   role     = "roles/run.invoker"
#    member = "user:foino74@gmail.com"
# }

# Admin サービスは特定ユーザーのみアクセス可能
# resource "google_cloud_run_service_iam_member" "admin_public_access" {
#   service  = module.admin_service.service_name
#   location = var.region
#   role     = "roles/run.invoker"
#    member = "user:foino74@gmail.com"
# }

# API サービスは特定ユーザーのみアクセス可能
# resource "google_cloud_run_service_iam_member" "api_public_access" {
#   service  = module.api_service.service_name
#   location = var.region
#   role     = "roles/run.invoker"
#    member = "user:foino74@gmail.com"
# }
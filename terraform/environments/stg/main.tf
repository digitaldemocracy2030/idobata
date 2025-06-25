module "environment" {
  source = "../../modules/environment"
  environment = "stg"
  
  # Scaling settings
  # アクセス数が限定的、管理者のみ
  admin_min_instances = 0    # 普段は0でOK
  admin_max_instances = 3    # 管理者数人程度なので少なめ

  # 一般ユーザーがアクセス、トラフィック多め
  user_min_instances  = 1    # 常時利用可能に
  user_max_instances  = 20   # ユーザー数に応じて多め

  # Admin, User両方から利用される重要な部分
  api_min_instances   = 1    # 常時稼働必須
  api_max_instances   = 15   # バックエンド処理で重要

  # Pythonサービス  AI処理、計  算集約的だが使用頻度は限定的
  # 使用時のみ起動、AI処理時にスケール
  python_min_instances = 0   # 使用時のみ起動
  python_max_instances = 10  # AI処理時にスケール
  python_memory = "2Gi"      # AI処理には大容量メモリ必要
  python_cpu    = "2"        # 計算集約的

  # Environment variables per service
  admin_env_vars = {
    VITE_ADMIN_FRONTEND_ALLOWED_HOSTS = var.vite_admin_frontend_allowed_hosts
  }
  
  user_env_vars = {
    VITE_FRONTEND_ALLOWED_HOSTS = var.vite_frontend_allowed_hosts
  }
  
  api_env_vars = {
    MONGODB_URI        = var.mongodb_uri
    API_BASE_URL       = var.api_base_url
    PASSWORD_PEPPER    = var.password_pepper
    OPENROUTER_API_KEY = var.openrouter_api_key
    IDEA_CORS_ORIGIN   = var.idea_cors_origin
    JWT_SECRET         = var.jwt_secret
    JWT_EXPIRES_IN     = "1d"
    ALLOW_DELETE_THEME = var.allow_delete_theme
  }
  
  python_env_vars = {
    OPENAI_API_KEY = var.openai_api_key
  }
  
  # Public access (all services are public in prod)
  public_services = toset(["admin", "user", "api"])
  
  # Domain mapping enabled
  enable_domain_mapping = true
}
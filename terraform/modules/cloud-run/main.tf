# modules/cloud-run/main.tf
resource "google_cloud_run_service" "service" {
  name     = var.service_name
  location = var.location

  template {
    spec {
      service_account_name = var.service_account
      
      containers {
        image = var.image
        
        resources {
          limits = {
            memory = var.memory
            cpu    = var.cpu
          }
        }
        
        # 環境変数
        dynamic "env" {
          for_each = var.env_vars
          content {
            name  = env.key
            value = env.value
          }
        }
        
        # Secret Manager（今回は使わない）
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = var.min_instances
        "autoscaling.knative.dev/maxScale" = var.max_instances
      }
    }
  }
  
  metadata {
    labels = var.labels
  }
}
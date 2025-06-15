# Outputs
output "service_urls" {
  value = {
    admin  = module.admin_service.service_url
    user   = module.user_service.service_url
    api    = module.api_service.service_url
    python = module.python_service.service_url
  }
  description = "Cloud Run service URLs"
}

output "chromadb_bucket" {
  value       = google_storage_bucket.chromadb.name
  description = "ChromaDB storage bucket name"
}

output "artifact_registry" {
  value       = google_artifact_registry_repository.containers.id
  description = "Artifact Registry repository ID"
}
# DNS設定用の出力
output "dns_records" {
  value = {
    admin = google_cloud_run_domain_mapping.admin.status[0].resource_records
    user  = google_cloud_run_domain_mapping.user.status[0].resource_records
    api   = google_cloud_run_domain_mapping.api.status[0].resource_records
  }
  description = "Required DNS records for custom domains"
}
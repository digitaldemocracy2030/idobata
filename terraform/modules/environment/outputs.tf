# terraform/modules/environment/outputs.tf

output "artifact_registry_repository" {
  description = "Artifact Registry repository details"
  value = {
    id   = google_artifact_registry_repository.containers.id
    name = google_artifact_registry_repository.containers.name
    location = google_artifact_registry_repository.containers.location
  }
}

output "storage_bucket" {
  description = "ChromaDB storage bucket details"
  value = {
    name = google_storage_bucket.chromadb.name
    url  = google_storage_bucket.chromadb.url
  }
}

output "service_accounts" {
  description = "Service account emails"
  value = {
    for service, sa in google_service_account.services : service => sa.email
  }
}

output "service_urls" {
  description = "Cloud Run service URLs"
  value = {
    admin  = module.admin_service.service_url
    user   = module.user_service.service_url
    api    = module.api_service.service_url
    python = module.python_service.service_url
  }
}

output "domain_mappings" {
  description = "Domain mapping URLs"
  value = var.enable_domain_mapping ? {
    admin = length(google_cloud_run_domain_mapping.admin) > 0 ? google_cloud_run_domain_mapping.admin[0].name : null
    user  = length(google_cloud_run_domain_mapping.user) > 0 ? google_cloud_run_domain_mapping.user[0].name : null
    api   = length(google_cloud_run_domain_mapping.api) > 0 ? google_cloud_run_domain_mapping.api[0].name : null
  } : {}
}

output "services" {
  description = "Service names"
  value = local.services
}
# modules/cloud-run/outputs.tf

output "service_url" {
  value       = google_cloud_run_service.service.status[0].url
  description = "The URL of the Cloud Run service"
}

output "service_name" {
  value       = google_cloud_run_service.service.name
  description = "The name of the Cloud Run service"
}

output "service_id" {
  value       = google_cloud_run_service.service.id
  description = "The ID of the Cloud Run service"
}

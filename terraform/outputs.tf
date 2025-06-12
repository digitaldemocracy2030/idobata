# terraform/outputs.tf

output "project_info" {
  value = {
    project_id = var.project_id
    region     = var.region
  }
  description = "プロジェクト情報"
}

output "service_urls" {
  value = {
    api = try(module.api_service_dev.url, "Not deployed")
    llm = try(module.llm_service_dev.url, "Not deployed")
  }
  description = "デプロイされたサービスのURL"
}

output "storage_info" {
  value = {
    chromadb_bucket = try(module.chromadb_storage_dev.bucket_name, "Not created")
  }
  description = "ストレージ情報"
}
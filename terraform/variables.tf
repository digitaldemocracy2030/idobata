# terraform/variables.tf

variable "project_id" {
  type        = string
  description = "GCPプロジェクトID"
}

variable "region" {
  type        = string
  description = "GCPリージョン"
  default     = "asia-northeast1"
}

variable "mongodb_uri" {
  type        = string
  description = "MongoDB Atlas接続文字列"
  sensitive   = true
}
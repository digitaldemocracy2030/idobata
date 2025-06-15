# modules/cloud-run/variables.tf

variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
}

variable "location" {
  description = "Location for the Cloud Run service"
  type        = string
}

variable "image" {
  description = "Docker image URL"
  type        = string
}

variable "service_account" {
  description = "Service account email"
  type        = string
}

variable "env_vars" {
  description = "Environment variables"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Secret Manager secrets to mount"
  type        = map(string)
  default     = {}
}

variable "memory" {
  description = "Memory limit"
  type        = string
  default     = "512Mi"
}

variable "cpu" {
  description = "CPU limit"
  type        = string
  default     = "1"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 100
}

variable "labels" {
  description = "Labels to apply to the service"
  type        = map(string)
  default     = {}
}
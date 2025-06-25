# terraform/modules/environment/variables.tf

# 基本設定
variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
  default     = "daikibo-jyukugi-cdp"  #
}

variable "region" {
  description = "Google Cloud Region"
  type        = string
  default     = "asia-northeast1"
}

variable "environment" {
  description = "Environment name (prod, stg, dev)"
  type        = string
  validation {
    condition     = contains(["prod", "stg", "dev"], var.environment)
    error_message = "Environment must be one of: prod, stg, dev."
  }
}

variable "team_name" {
  description = "Team name for labeling"
  type        = string
  default     = "platform"
}

# Domain mapping
variable "enable_domain_mapping" {
  description = "Enable domain mapping for services"
  type        = bool
  default     = true
}

# Public access settings
variable "public_services" {
  description = "Services that should have public access"
  type        = set(string)
  default     = ["admin", "user", "api"]
}

# Image tags
variable "admin_image_tag" {
  description = "Admin service image tag"
  type        = string
  default     = "latest"
}

variable "user_image_tag" {
  description = "User service image tag"
  type        = string
  default     = "latest"
}

variable "api_image_tag" {
  description = "API service image tag"
  type        = string
  default     = "latest"
}

variable "python_image_tag" {
  description = "Python service image tag"
  type        = string
  default     = "latest"
}

# Admin service settings
variable "admin_min_instances" {
  description = "Minimum instances for admin service"
  type        = number
  default     = 0
}

variable "admin_max_instances" {
  description = "Maximum instances for admin service"
  type        = number
  default     = 10
}

variable "admin_env_vars" {
  description = "Environment variables for admin service"
  type        = map(string)
  default     = {}
}

# User service settings
variable "user_min_instances" {
  description = "Minimum instances for user service"
  type        = number
  default     = 0
}

variable "user_max_instances" {
  description = "Maximum instances for user service"
  type        = number
  default     = 10
}

variable "user_env_vars" {
  description = "Environment variables for user service"
  type        = map(string)
  default     = {}
}

# API service settings
variable "api_min_instances" {
  description = "Minimum instances for API service"
  type        = number
  default     = 0
}

variable "api_max_instances" {
  description = "Maximum instances for API service"
  type        = number
  default     = 10
}

variable "api_env_vars" {
  description = "Environment variables for API service"
  type        = map(string)
  default     = {}
}

# Python service settings
variable "python_min_instances" {
  description = "Minimum instances for Python service"
  type        = number
  default     = 0
}

variable "python_max_instances" {
  description = "Maximum instances for Python service"
  type        = number
  default     = 5
}

variable "python_memory" {
  description = "Memory allocation for Python service"
  type        = string
  default     = "2Gi"
}

variable "python_cpu" {
  description = "CPU allocation for Python service"
  type        = string
  default     = "2"
}

variable "python_env_vars" {
  description = "Environment variables for Python service"
  type        = map(string)
  default     = {}
}
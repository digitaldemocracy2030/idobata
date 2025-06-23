# environments/stg/variables.tf

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "asia-northeast1"
}

variable "team_name" {
  description = "Team name for labeling"
  type        = string
  default     = "platform"
}

# Container image tags
variable "admin_image_tag" {
  description = "Image tag for admin service"
  type        = string
  default     = "latest"
}

variable "user_image_tag" {
  description = "Image tag for user service"
  type        = string
  default     = "latest"
}

variable "api_image_tag" {
  description = "Image tag for API service"
  type        = string
  default     = "latest"
}

variable "python_image_tag" {
  description = "Image tag for Python service"
  type        = string
  default     = "latest"
}

# Scaling configurations
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

variable "user_min_instances" {
  description = "Minimum instances for user service"
  type        = number
  default     = 1
}

variable "user_max_instances" {
  description = "Maximum instances for user service"
  type        = number
  default     = 20
}

variable "api_min_instances" {
  description = "Minimum instances for API service"
  type        = number
  default     = 1
}

variable "api_max_instances" {
  description = "Maximum instances for API service"  
  type        = number
  default     = 20
}

variable "python_min_instances" {
  description = "Minimum instances for Python service"
  type        = number
  default     = 0
}

variable "python_max_instances" {
  description = "Maximum instances for Python service"
  type        = number
  default     = 10
}

# Feature flags
variable "enable_public_access" {
  description = "Enable public access to admin and user services"
  type        = bool
  default     = true
}

# Python service configuration
variable "python_api_url" {
  description = "API URL for Python service"
  type        = string
  default     = ""
}

# Sensitive variables
variable "openai_api_key" {
  description = "OpenAI API Key"
  type        = string
  sensitive   = true
}

variable "mongodb_uri" {
  description = "MongoDB connection URI"
  type        = string
  sensitive   = true
}

variable "api_base_url" {
  description = "API base URL"
  type        = string
  default     = ""
}

# API service sensitive variables
variable "password_pepper" {
  description = "Password pepper for API service"
  type        = string
  sensitive   = true
}

variable "openrouter_api_key" {
  description = "OpenRouter API Key"
  type        = string
  sensitive   = true
}

variable "idea_cors_origin" {
  description = "CORS origin for IDEA frontend"
  type        = string
  default     = ""
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "allow_delete_theme" {
  description = "Allow delete theme"
  type        = string
  default     = "false"
}

variable "admin_frontend_allowed_hosts" {
  description = "Allowed hosts for admin frontend"
  type        = string
  default     = ""
}

variable "vite_frontend_allowed_hosts" {
  description = "Allowed hosts for vite frontend"
  type        = string
  default     = ""
}
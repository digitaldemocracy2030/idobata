variable "mongodb_uri" {
  type = string
  sensitive = true
}

variable "api_base_url" {
  type = string
}

variable "password_pepper" {
  type = string
  sensitive = true
}

variable "openrouter_api_key" {
  type = string
  sensitive = true
}



variable "idea_cors_origin" {
  type = string
}

variable "jwt_secret" {
  type = string
  sensitive = true
}

variable "allow_delete_theme" {
  type = string
  sensitive = true
}


variable "admin_frontend_allowed_hosts" {
  type = string
}

variable "vite_frontend_allowed_hosts" {
  type = string
}

variable "openai_api_key" {
  type = string
  sensitive = true
}
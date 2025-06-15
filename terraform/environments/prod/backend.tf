# environments/prod/backend.tf
terraform {
  backend "gcs" {
    bucket = "daikibo-jyukugi-cdp-terraform-state"
    prefix = "terraform/prod"
  }
}
terraform {
  backend "gcs" {
    bucket = "daikibo-jyukugi-cdp-terraform-state"
    prefix = "terraform/stg"
  }
}
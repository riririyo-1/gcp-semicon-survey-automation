# -- Terraform Backend設定（GCS） --------------
terraform {
  backend "gcs" {
    bucket = "gcp-semicon-survey-automation-terraform-state"
    prefix = "terraform/state"
  }
}

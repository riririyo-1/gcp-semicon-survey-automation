# -- 変数定義 --------------

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "gcp-semicon-survey-automation"
}


variable "region" {
  description = "GCP Region"
  type        = string
  default     = "asia-northeast1"
}


variable "github_repository_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "riririyo-1"
}


variable "github_repository" {
  description = "GitHub repository (owner/repo)"
  type        = string
  default     = "riririyo-1/gcp-semicon-survey-automation"
}


variable "db_name" {
  description = "Cloud SQL database name"
  type        = string
  default     = "semicon_survey"
}


variable "db_user" {
  description = "Cloud SQL database user"
  type        = string
  default     = "postgres"
}

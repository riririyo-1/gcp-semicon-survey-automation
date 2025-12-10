# -- Terraform Output定義 --------------

output "workload_identity_provider" {
  description = "Workload Identity Provider for GitHub Actions"
  value       = google_iam_workload_identity_pool_provider.github.name
}


output "github_actions_service_account" {
  description = "GitHub Actions Service Account email"
  value       = google_service_account.github_actions.email
}


output "cloudsql_connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.main.connection_name
}


output "cloudsql_instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.main.name
}


output "artifact_registry_repository" {
  description = "Artifact Registry repository name"
  value       = google_artifact_registry_repository.containers.name
}


output "db_password_secret_name" {
  description = "Database password secret name in Secret Manager"
  value       = google_secret_manager_secret.db_password.secret_id
}

# ================================================================================
# GCP Semicon Survey Automation - Terraform Main Configuration
# ================================================================================


# -- 必要なAPIの有効化 --------------
resource "google_project_service" "run" {
  project = var.project_id
  service = "run.googleapis.com"

  disable_on_destroy = false
}


# -- ランダムパスワード生成（Cloud SQL用） --------------
resource "random_password" "db_password" {
  length  = 32
  special = true
}


# -- Artifact Registry（Dockerイメージ保存） --------------
resource "google_artifact_registry_repository" "containers" {
  location      = var.region
  repository_id = "containers"
  description   = "Docker container images for RSS collector, metadata generator, and frontend"
  format        = "DOCKER"
}


# -- Secret Manager（機密情報管理） --------------

# Cloud SQLパスワード
resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# OpenAI API Key（手動で値を設定する）
resource "google_secret_manager_secret" "openai_api_key" {
  secret_id = "openai-api-key"
  replication {
    auto {}
  }
}


# -- Cloud SQL（PostgreSQL） --------------
resource "google_sql_database_instance" "main" {
  name             = "semicon-survey-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier                  = "db-f1-micro"
    availability_type     = "ZONAL"
    disk_size             = 10
    disk_type             = "PD_SSD"
    disk_autoresize       = true
    disk_autoresize_limit = 20

    backup_configuration {
      enabled                        = true
      start_time                     = "03:00"
      point_in_time_recovery_enabled = false
      backup_retention_settings {
        retained_backups = 1
      }
      transaction_log_retention_days = 1
    }

    ip_configuration {
      ipv4_enabled = true
      require_ssl  = false
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }
  }

  deletion_protection = false
}

# データベース作成
resource "google_sql_database" "main" {
  name     = var.db_name
  instance = google_sql_database_instance.main.name
}

# ユーザー作成
resource "google_sql_user" "main" {
  name     = var.db_user
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}


# -- Workload Identity Pool（GitHub Actions用） --------------
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub Actions Pool"
  description               = "Workload Identity Pool for GitHub Actions"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub Provider"
  description                        = "OIDC provider for GitHub Actions"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  attribute_condition = "assertion.repository == '${var.github_repository}'"
}


# -- サービスアカウント（GitHub Actions用） --------------
resource "google_service_account" "github_actions" {
  account_id   = "github-actions"
  display_name = "GitHub Actions Service Account"
  description  = "Service account for GitHub Actions CI/CD"
}

# Workload Identity BindingでGitHub ActionsがSAを使えるようにする
resource "google_service_account_iam_member" "github_actions_workload_identity" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repository}"
}


# -- GitHub ActionsサービスアカウントへのIAMロール付与 --------------

# Cloud Run管理者
resource "google_project_iam_member" "github_actions_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Artifact Registry書き込み
resource "google_project_iam_member" "github_actions_artifact_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Cloud SQL管理者
resource "google_project_iam_member" "github_actions_cloudsql_admin" {
  project = var.project_id
  role    = "roles/cloudsql.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Secret Manager管理者
resource "google_project_iam_member" "github_actions_secret_admin" {
  project = var.project_id
  role    = "roles/secretmanager.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# IAM ServiceAccountUser（Cloud Runにデプロイするため）
resource "google_project_iam_member" "github_actions_service_account_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Cloud Build Editor（gcloud builds submitのため）
resource "google_project_iam_member" "github_actions_cloudbuild_builds_editor" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.editor"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Compute Network Admin（将来のために保持）
resource "google_project_iam_member" "github_actions_compute_network_admin" {
  project = var.project_id
  role    = "roles/compute.networkAdmin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Storage Admin（Terraform State管理のため）
resource "google_project_iam_member" "github_actions_storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Project IAM Admin（IAMポリシー管理のため）
resource "google_project_iam_member" "github_actions_project_iam_admin" {
  project = var.project_id
  role    = "roles/resourcemanager.projectIamAdmin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Workload Identity Pool Admin（Workload Identity管理のため）
resource "google_project_iam_member" "github_actions_workload_identity_pool_admin" {
  project = var.project_id
  role    = "roles/iam.workloadIdentityPoolAdmin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Service Account Admin（サービスアカウントIAM管理のため）
resource "google_project_iam_member" "github_actions_service_account_admin" {
  project = var.project_id
  role    = "roles/iam.serviceAccountAdmin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Cloud Scheduler Admin（Cloud Scheduler管理のため）
resource "google_project_iam_member" "github_actions_cloudscheduler_admin" {
  project = var.project_id
  role    = "roles/cloudscheduler.admin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

# Service Usage Admin（API有効化のため）
resource "google_project_iam_member" "github_actions_service_usage_admin" {
  project = var.project_id
  role    = "roles/serviceusage.serviceUsageAdmin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}


# -- サービスアカウント（Cloud Run Jobs/Service用） --------------
resource "google_service_account" "cloudrun_app" {
  account_id   = "cloudrun-app"
  display_name = "Cloud Run Application Service Account"
  description  = "Service account for Cloud Run Jobs and Services"
}

# Cloud SQL接続権限
resource "google_project_iam_member" "cloudrun_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloudrun_app.email}"
}

# Cloud Run Invoker権限（Cloud Schedulerからのジョブ実行に必要）
resource "google_project_iam_member" "cloudrun_invoker" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.cloudrun_app.email}"
}

# Secret Managerアクセス権限
resource "google_secret_manager_secret_iam_member" "cloudrun_db_password_access" {
  secret_id = google_secret_manager_secret.db_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_app.email}"
}

resource "google_secret_manager_secret_iam_member" "cloudrun_openai_key_access" {
  secret_id = google_secret_manager_secret.openai_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_app.email}"
}


# -- Cloud Run Jobs --------------

# RSS Collector Job
resource "google_cloud_run_v2_job" "rss_collector" {
  name     = "rss-collector"
  location = var.region

  template {
    template {
      service_account = google_service_account.cloudrun_app.email
      timeout         = "7200s"
      max_retries     = 1

      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/containers/rss-collector:latest"

        env {
          name  = "DB_HOST"
          value = "/cloudsql/${var.project_id}:${var.region}:semicon-survey-db"
        }
        env {
          name  = "DB_NAME"
          value = var.db_name
        }
        env {
          name  = "DB_USER"
          value = var.db_user
        }
        env {
          name = "DB_PASSWORD"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.db_password.secret_id
              version = "latest"
            }
          }
        }
        env {
          name = "OPENAI_API_KEY"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.openai_api_key.secret_id
              version = "latest"
            }
          }
        }

        resources {
          limits = {
            cpu    = "2"
            memory = "1Gi"
          }
        }

        volume_mounts {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }
      }

      volumes {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [google_sql_database_instance.main.connection_name]
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].template[0].containers[0].image,
    ]
  }

  depends_on = [
    google_sql_database_instance.main
  ]
}

# Metadata Generator Job
resource "google_cloud_run_v2_job" "metadata_generator" {
  name     = "metadata-generator"
  location = var.region

  template {
    template {
      service_account = google_service_account.cloudrun_app.email
      timeout         = "3600s"
      max_retries     = 1

      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/containers/metadata-generator:latest"

        env {
          name  = "DB_HOST"
          value = "/cloudsql/${var.project_id}:${var.region}:semicon-survey-db"
        }
        env {
          name  = "DB_NAME"
          value = var.db_name
        }
        env {
          name  = "DB_USER"
          value = var.db_user
        }
        env {
          name = "DB_PASSWORD"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.db_password.secret_id
              version = "latest"
            }
          }
        }
        env {
          name = "OPENAI_API_KEY"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.openai_api_key.secret_id
              version = "latest"
            }
          }
        }

        resources {
          limits = {
            cpu    = "2"
            memory = "2Gi"
          }
        }

        volume_mounts {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }
      }

      volumes {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [google_sql_database_instance.main.connection_name]
        }
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].template[0].containers[0].image,
    ]
  }

  depends_on = [
    google_sql_database_instance.main
  ]
}


# -- Cloud Scheduler（定期実行トリガー） --------------

# RSS Collectorジョブ用スケジューラ
resource "google_cloud_scheduler_job" "rss_collector" {
  name             = "rss-collector-trigger"
  description      = "Trigger RSS Collector job every 6 hours"
  schedule         = "0 5 * * *"
  time_zone        = "Asia/Tokyo"
  attempt_deadline = "1800s"

  retry_config {
    retry_count = 1
  }

  http_target {
    http_method = "POST"
    uri         = "https://${var.region}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${var.project_id}/jobs/rss-collector:run"

    oauth_token {
      service_account_email = google_service_account.cloudrun_app.email
    }
  }

  depends_on = [
    google_project_iam_member.cloudrun_cloudsql_client,
    google_cloud_run_v2_job.rss_collector
  ]
}

# Metadata Generatorジョブ用スケジューラ
resource "google_cloud_scheduler_job" "metadata_generator" {
  name             = "metadata-generator-trigger"
  description      = "Trigger Metadata Generator job every 6 hours (1 hour after RSS collection)"
  schedule         = "0 6 * * *"
  time_zone        = "Asia/Tokyo"
  attempt_deadline = "1800s"

  retry_config {
    retry_count = 1
  }

  http_target {
    http_method = "POST"
    uri         = "https://${var.region}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${var.project_id}/jobs/metadata-generator:run"

    oauth_token {
      service_account_email = google_service_account.cloudrun_app.email
    }
  }

  depends_on = [
    google_project_iam_member.cloudrun_cloudsql_client,
    google_cloud_run_v2_job.metadata_generator
  ]
}

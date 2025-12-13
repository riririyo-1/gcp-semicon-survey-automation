# Cloud Run Jobs を Terraform 管理下に移行する手順

## 現状

- 既存の Cloud Run Jobs が手動で作成されている
  - `rss-collector` (2025-12-10 作成)
  - `metadata-generator` (2025-12-10 作成)
- Terraform コードに Jobs の定義を追加済み

## 安全な移行手順

### ステップ 1: 既存の Jobs を削除

既存の Jobs を削除して、Terraform で再作成します。

```bash
# 既存のCloud Run Jobsを削除
gcloud run jobs delete rss-collector --region asia-northeast1 --quiet
gcloud run jobs delete metadata-generator --region asia-northeast1 --quiet
```

### ステップ 2: Terraform 初期化と検証

```bash
cd infra

# Terraform初期化（必要に応じて）
terraform init

# 実行プランを確認
terraform plan
```

**確認ポイント:**

- `google_vpc_access_connector.connector` が作成される
- `google_cloud_run_v2_job.rss_collector` が作成される
- `google_cloud_run_v2_job.metadata_generator` が作成される
- `google_cloud_scheduler_job.rss_collector` が更新される
- `google_cloud_scheduler_job.metadata_generator` が更新される

### ステップ 3: Terraform 適用

```bash
# リソースを作成
terraform apply
```

### ステップ 4: 動作確認

```bash
# Cloud Run Jobsが作成されたことを確認
gcloud run jobs list --region asia-northeast1

# 手動でJobを実行してテスト
gcloud run jobs execute rss-collector --region asia-northeast1

# 実行状況を確認
gcloud run jobs executions list --region asia-northeast1
```

## 追加された主要リソース

### 1. VPC Connector

```hcl
resource "google_vpc_access_connector" "connector"
```

- Cloud Run Jobs が Cloud SQL にプライベート IP で接続するために必要
- IP レンジ: `10.8.0.0/28`

### 2. Cloud Run Jobs

```hcl
resource "google_cloud_run_v2_job" "rss_collector"
resource "google_cloud_run_v2_job" "metadata_generator"
```

- サービスアカウント: `cloudrun-app`
- VPC Connector 経由で Cloud SQL に接続
- Secret Manager から環境変数を注入
- `lifecycle.ignore_changes` でイメージタグの変更を GitHub Actions に委譲

### 3. 依存関係の追加

- Cloud Scheduler が Jobs の存在に依存するよう設定済み

## 注意事項

1. **VPC Connector の作成には 5-10 分かかります**
2. **既存の Jobs は削除されるため、スケジュール実行中の場合は完了を待つ**
3. **GitHub Actions のワークフローは変更不要** (Jobs 作成後は `update` が成功するため)

## ロールバック方法

もし問題が発生した場合:

```bash
# 特定のリソースのみ削除
terraform destroy -target=google_cloud_run_v2_job.rss_collector
terraform destroy -target=google_cloud_run_v2_job.metadata_generator
terraform destroy -target=google_vpc_access_connector.connector

# 手動で再作成（GitHub Actionsのデプロイコマンドを参考に）
```

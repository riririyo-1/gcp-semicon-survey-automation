# cleanup_duplicate_sources

不正な出典名を持つ記事を削除するスクリプト

## 概要

過去の実装で、メタタグやURLから出典を取得していたため、同じサイトでもカテゴリによって異なる出典名が付与されていた。
現在はrss_feeds.yamlの大項目（source_name）を使用するよう修正済み。

このスクリプトは、古い実装で作成された不正な出典名のレコードを削除する。

## 削除対象

- ITmedia エグゼクティブ
- ITmedia エンタープライズ
- ITmedia ビジネスオンライン
- ITmedia Mobile
- ITmedia NEWS
- ITmedia PC USER

## ファイル

| ファイル名 | 説明 |
|-----------|------|
| cleanup_duplicate_sources.sql | SQL実行版 |
| cleanup_sources.py | Python実行版（Cloud Run Job対応） |
| Dockerfile | cleanup_sources.py用Dockerイメージ |

## 実行方法

### SQLファイルで実行

```bash
gcloud sql connect semicon-survey-db --user=postgres --database=semicon_survey < cleanup_duplicate_sources.sql
```

### Pythonスクリプトで実行（ローカル）

```bash
export DB_HOST=/cloudsql/gcp-semicon-survey-automation:asia-northeast1:semicon-survey-db
export DB_NAME=semicon_survey
export DB_USER=postgres
export DB_PASSWORD=xxx

python cleanup_sources.py
```

### Cloud Run Jobとして実行

```bash
# Dockerイメージをビルド・プッシュ
docker build -t asia-northeast1-docker.pkg.dev/gcp-semicon-survey-automation/containers/cleanup-sources .
docker push asia-northeast1-docker.pkg.dev/gcp-semicon-survey-automation/containers/cleanup-sources

# Cloud Run Jobを作成
gcloud run jobs create cleanup-sources \
  --image asia-northeast1-docker.pkg.dev/gcp-semicon-survey-automation/containers/cleanup-sources:latest \
  --region asia-northeast1 \
  --service-account cloudrun-app@gcp-semicon-survey-automation.iam.gserviceaccount.com \
  --set-secrets=DB_PASSWORD=db-password:latest \
  --set-env-vars=DB_HOST=/cloudsql/gcp-semicon-survey-automation:asia-northeast1:semicon-survey-db \
  --set-env-vars=DB_NAME=semicon_survey \
  --set-env-vars=DB_USER=postgres \
  --set-cloudsql-instances=gcp-semicon-survey-automation:asia-northeast1:semicon-survey-db \
  --max-retries=0 \
  --task-timeout=10m

# ジョブを実行
gcloud run jobs execute cleanup-sources --region=asia-northeast1
```

## 実行結果（参考）

```
=== 削除対象の出典一覧 ===
  ITmedia エグゼクティブ: 3件
  ITmedia エンタープライズ: 4件
  ITmedia ビジネスオンライン: 16件
  ITmedia Mobile: 36件
  ITmedia NEWS: 25件
  ITmedia PC USER: 28件

合計: 112件

=== ITmedia関連の不正な出典名を削除 ===
削除完了: 112件
```

## 注意事項

- 本番環境での実行前に必ずバックアップを取得すること
- 削除前に対象データを確認するクエリを実行するため、安全性が高い
- Cloud Run Jobとして実行する場合、適切なIAM権限が必要
  - Cloud SQL Client
  - Secret Manager Accessor

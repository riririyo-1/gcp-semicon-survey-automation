# normalize_sources

出典名を統一するスクリプト

## 概要

データベース内の出典名を、rss_feeds.yamlの大項目と一致するように統一する。

## ファイル

| ファイル名 | 説明 |
|-----------|------|
| normalize_sources.sql | SQL実行版 |
| normalize_sources.py | Python実行版 |

## 統一ルール

現在のスクリプトでは、以下のような統一が行われる（例）:

- `マイナビ Tech+ enterprise` → `マイナビ Tech+`
- `ITmedia PC USER` → `ITmedia`
- `日経クロステック（xTECH）` → `日経XTECH`

※ 実際の統一ルールはスクリプト内で定義

## 実行方法

### SQLファイルで実行

```bash
gcloud sql connect semicon-survey-db --user=postgres --database=semicon_survey < normalize_sources.sql
```

### Pythonスクリプトで実行

```bash
export DB_HOST=/cloudsql/gcp-semicon-survey-automation:asia-northeast1:semicon-survey-db
export DB_NAME=semicon_survey
export DB_USER=postgres
export DB_PASSWORD=xxx

python normalize_sources.py
```

## 使用タイミング

- rss_feeds.yamlの大項目を変更した場合
- データベース内の出典名が不統一な場合

## 注意事項

- 本番環境での実行前に必ずバックアップを取得すること
- 統一ルールはスクリプト内で定義されているため、必要に応じて修正すること
- cleanup_duplicate_sources とは異なり、データを削除せず更新する

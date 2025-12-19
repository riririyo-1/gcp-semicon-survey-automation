# init_db

データベース初期化スクリプト

## 概要

Cloud SQLインスタンス作成後の初回セットアップ用スクリプト。
articlesテーブルの作成とインデックス設定を行う。

## ファイル

| ファイル名 | 説明 |
|-----------|------|
| init_db.sql | データベース初期化SQL |

## テーブル構造

### articles

| カラム名 | 型 | 説明 |
|---------|---|------|
| id | UUID | プライマリキー（自動生成） |
| title | VARCHAR(500) | 記事タイトル |
| url | TEXT | 記事URL（ユニーク制約） |
| source | VARCHAR(200) | 記事出典 |
| image_url | TEXT | 記事トップ画像URL |
| content | TEXT | 記事本文 |
| published_date | TIMESTAMP | 記事公開日 |
| summary | TEXT | 記事要約 |
| tags | TEXT[] | タグ（配列） |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |
| metadata_generated | BOOLEAN | メタデータ付与済みフラグ |

### インデックス

- idx_published_date: published_dateカラム
- idx_source: sourceカラム
- idx_tags: tagsカラム（GINインデックス）
- idx_metadata_generated: metadata_generatedカラム

### トリガー

- update_articles_updated_at: 更新時にupdated_atを自動更新

## 実行方法

### gcloud経由で実行

```bash
gcloud sql connect semicon-survey-db --user=postgres --database=semicon_survey < init_db.sql
```

### Cloud SQL Auth Proxy経由で実行

```bash
# プロキシ起動（別ターミナル）
./cloud-sql-proxy gcp-semicon-survey-automation:asia-northeast1:semicon-survey-db &

# パスワード取得
DB_PASSWORD=$(gcloud secrets versions access latest --secret="db-password")

# SQL実行
PGPASSWORD=${DB_PASSWORD} psql -h localhost -U postgres -d semicon_survey -f init_db.sql
```

## 使用タイミング

- Cloud SQLインスタンス作成直後の初回のみ
- テーブル構造を変更する場合（マイグレーション）

## 注意事項

- すでにテーブルが存在する場合、`IF NOT EXISTS`により作成はスキップされる
- トリガーは既存のものを削除してから再作成される

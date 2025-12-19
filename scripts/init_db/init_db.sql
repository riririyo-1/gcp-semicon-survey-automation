-- -- データベース初期化スクリプト --------------

-- articles テーブル作成
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source VARCHAR(200) NOT NULL,
    image_url TEXT,
    content TEXT,
    published_date TIMESTAMP,
    summary TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata_generated BOOLEAN DEFAULT FALSE
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_published_date ON articles(published_date);
CREATE INDEX IF NOT EXISTS idx_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_tags ON articles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_metadata_generated ON articles(metadata_generated);

-- updated_at自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー作成
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

FROM python:3.12-slim

WORKDIR /app

# 依存関係をインストール
RUN pip install --no-cache-dir psycopg2-binary

# スクリプトをコピー
COPY cleanup_sources.py .

# 実行
CMD ["python", "cleanup_sources.py"]

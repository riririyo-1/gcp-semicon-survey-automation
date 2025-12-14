FROM python:3.12-slim

WORKDIR /app

# 依存関係をインストール
RUN pip install --no-cache-dir psycopg2-binary python-dotenv

# スクリプトをコピー
COPY normalize_sources.py .

# スクリプトを実行
CMD ["python", "normalize_sources.py"]

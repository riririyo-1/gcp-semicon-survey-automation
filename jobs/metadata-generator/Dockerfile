# Python 3.12 ベースイメージ
FROM python:3.12-slim

# 作業ディレクトリ設定
WORKDIR /app

# 依存パッケージインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションファイルコピー
COPY main.py .

# 実行
CMD ["python", "main.py"]

import os
import re
import sys
import yaml
import feedparser
import requests
import psycopg2
from bs4 import BeautifulSoup
from datetime import datetime
from dateutil import parser as dateparser
from dotenv import load_dotenv
from urllib.parse import urlparse
from openai import OpenAI


# -- 環境変数読み込み --------------
load_dotenv()

DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)


# -- RSSフィード設定読み込み --------------
def load_rss_feeds(yaml_path: str) -> dict:
    with open(yaml_path, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
    return config.get("sources", {})


# -- PostgreSQL接続 --------------
def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )


# -- 接続確認 --------------
def connection_confirmation(url: str) -> tuple[bool, str]:
    try:
        response = requests.get(url, verify=True, timeout=10)
        response.raise_for_status()
        return True, ""
    except requests.exceptions.RequestException as e:
        return False, str(e)


# -- 日付抽出 --------------
def get_date(url: str) -> str | None:
    try:
        response = requests.get(url, verify=True, timeout=10)
        soup = BeautifulSoup(response.content, "html.parser")

        article_date = None
        formatted_date = None
        date_pattern = r'\d{4}-\d{2}-\d{2}'

        # <time>タグから取得
        date_element = soup.find("time")
        if date_element:
            article_date = date_element.get_text()
            print(f"  <time>要素: {article_date}")

        # <meta>タグから取得
        if not article_date:
            meta_tags = soup.find_all("meta")
            for tag in meta_tags:
                if tag.get("property") == "article:modified_time":
                    article_date = tag.get("content")
                    break
                elif tag.get("property") == "date":
                    article_date = tag.get("content")
                    break
            if article_date:
                print(f"  <meta>要素: {article_date}")

        # 特定のクラス名やIDから取得
        if not article_date:
            possible_date_elements = soup.find_all(attrs={"class": re.compile(r"date|time|datetime|published|the-date|cal", re.I)})
            for element in possible_date_elements:
                article_date = element.get_text().strip()
                if article_date:
                    print(f"  特定のクラス名やIDから取得: {article_date}")
                    break

        # 日付要素がある場合の処理
        if article_date:
            # 'YYYY-MM-DD' 形式に一致する場合
            if re.fullmatch(date_pattern, article_date):
                formatted_date = article_date

            # 'YYYY-MM-DD' 形式に一致しない場合、dateutilでパース
            else:
                try:
                    # dateutilで日付をパース（英語表記に対応）
                    parsed_date = dateparser.parse(article_date, fuzzy=True)
                    if parsed_date:
                        formatted_date = parsed_date.strftime("%Y-%m-%d")
                        print(f"  日付要素をISO8601形式へ: {formatted_date}")
                    else:
                        # dateutilでもパースできない場合のみOpenAI APIを使用
                        response = client.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=[
                                {"role": "system", "content": "You are a helpful assistant."},
                                {"role": "user", "content": f"What is the date '{article_date}' in the 'yyyy-mm-dd' format? Please answer with only the results."}
                            ],
                            max_tokens=50,
                            temperature=0.5
                        )
                        formatted_date = response.choices[0].message.content.strip()
                        print(f"  OpenAIで日付変換: {formatted_date}")
                except Exception as parse_error:
                    print(f"  日付パースエラー: {parse_error}")
                    formatted_date = None

        # ISO8601形式かチェック
        if formatted_date and re.fullmatch(date_pattern, formatted_date):
            print(f"  日付: {formatted_date}")
            return formatted_date
        else:
            print(f"  日付情報なし")
            return None

    except Exception as e:
        print(f"  日付取得エラー: {e}")
        return None


# -- トップ画像URL取得 --------------
def get_image_url(url: str) -> str | None:
    try:
        response = requests.get(url, verify=True, timeout=10)
        soup = BeautifulSoup(response.content, "html.parser")

        # og:image メタタグから取得
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            return og_image["content"]
    except Exception as e:
        print(f"  画像URL取得エラー: {e}")

    return None


# -- 記事をデータベースに保存 --------------
def save_article_to_db(conn, article: dict):
    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO articles (title, url, source, image_url, published_date)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (url) DO NOTHING
        """
        cursor.execute(query, (
            article["title"],
            article["url"],
            article["source"],
            article.get("image_url"),
            article.get("published_date")
        ))
        conn.commit()
        cursor.close()
        print(f"  保存成功: {article['title'][:50]}...")
    except Exception as e:
        conn.rollback()
        print(f"  保存エラー: {e}")


# -- RSSフィード処理 --------------
def process_rss_feeds(sources: dict, conn):
    article_count = 0

    for source_name, source_config in sources.items():
        feeds = source_config.get("feeds", [])

        for feed_config in feeds:
            feed_url = feed_config.get("url")
            category = feed_config.get("category", "unknown")

            print(f"\n処理中: {source_name} - {feed_url}")

            # RSSフィードをパース
            feed = feedparser.parse(feed_url)

            for entry in feed.entries:
                article_url = entry.get("link")
                article_title = entry.get("title", "No Title")

                if not article_url:
                    continue

                print(f"\n記事: {article_title}")

                # 接続確認
                is_connected, error_msg = connection_confirmation(article_url)
                if not is_connected:
                    print(f"  接続エラー: {error_msg}")
                    continue

                # 日付取得
                published_date = get_date(article_url)

                # 画像URL取得
                image_url = get_image_url(article_url)

                # 記事データ作成（出典はYAMLのsource_nameを使用）
                article = {
                    "title": article_title,
                    "url": article_url,
                    "source": source_name,
                    "image_url": image_url,
                    "published_date": published_date
                }

                # データベースに保存
                save_article_to_db(conn, article)
                article_count += 1

    print(f"\n\n処理完了: {article_count}件の記事を処理")


# -- メイン処理 --------------
def main():
    print("RSS Collector 開始")

    # RSSフィード設定読み込み
    rss_feeds_path = os.path.join(os.path.dirname(__file__), "rss_feeds.yaml")
    sources = load_rss_feeds(rss_feeds_path)

    # DB接続
    conn = get_db_connection()
    print("データベース接続成功")

    # RSSフィード処理
    process_rss_feeds(sources, conn)

    # DB接続クローズ
    conn.close()
    print("\nRSS Collector 完了")


if __name__ == "__main__":
    main()

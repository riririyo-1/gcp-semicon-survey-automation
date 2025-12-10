import os
import sys
import requests
import psycopg2
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain, SequentialChain
from langchain_openai import ChatOpenAI


# -- 環境変数読み込み --------------
load_dotenv()

DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")


# -- PostgreSQL接続 --------------
def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )


# -- メタデータ未生成の記事取得 --------------
def get_articles_without_metadata(conn) -> list[dict]:
    cursor = conn.cursor()
    query = """
        SELECT id, title, url, content
        FROM articles
        WHERE metadata_generated = FALSE
        ORDER BY created_at DESC
        LIMIT 100
    """
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()

    articles = []
    for row in rows:
        articles.append({
            "id": row[0],
            "title": row[1],
            "url": row[2],
            "content": row[3]
        })

    return articles


# -- 記事本文抽出 --------------
def get_article_text(url: str) -> str | None:
    try:
        response = requests.get(url, verify=True, timeout=15)
        soup = BeautifulSoup(response.content, "html.parser")
        article_text = soup.get_text()

        # 不要文字の削除
        characters_to_remove = ["\n", "\t", "\r", " "]
        for char in characters_to_remove:
            article_text = article_text.replace(char, "")

        return article_text.strip()

    except Exception as e:
        print(f"  本文抽出エラー: {e}")
        return None


# -- 要約とタグ生成 --------------
def generate_summary_and_tags(article_text: str) -> tuple[str | None, list[str]]:
    try:
        # LLM設定
        llm = ChatOpenAI(
            model_name="gpt-4o-mini",
            openai_api_key=OPENAI_API_KEY,
            temperature=0.5
        )

        # 要約生成プロンプト
        prompt_1 = PromptTemplate(
            input_variables=["article_text"],
            template="次の文章を200字程度で要約して。言語は記事本文と同じで。語尾は断定形で: {article_text}",
        )
        chain_1 = LLMChain(llm=llm, prompt=prompt_1, output_key="article_summary")

        # タグ生成プロンプト
        prompt_2 = PromptTemplate(
            input_variables=["article_summary"],
            template="""
次の記事の要約から、トピックを表すタグを生成して：
{article_summary}.
登場する企業、業界、分類を表すような2～20個の単語を、最小単位で、カンマ区切りで。
半導体関連の記事は「半導体」というタグを必ず含めて。
製品名、サービス名、企業名などの固有名詞も含めて。日本企業は日本語、外国企業はアルファベットで。
例: "AI, 半導体, テクノロジー, 自動運転, ソニー, NVIDIA, Apple, iPhone"
""",
        )
        chain_2 = LLMChain(llm=llm, prompt=prompt_2, output_key="article_tags")

        # SequentialChain構成
        overall_chain = SequentialChain(
            chains=[chain_1, chain_2],
            input_variables=["article_text"],
            output_variables=["article_summary", "article_tags"],
            verbose=True,
        )

        # 実行
        output = overall_chain({"article_text": article_text})

        # 結果抽出
        article_summary = output["article_summary"]
        article_tags_str = output["article_tags"]

        # タグをリストに変換
        tags_list = [tag.strip() for tag in article_tags_str.split(",") if tag.strip()]

        return article_summary, tags_list

    except Exception as e:
        print(f"  要約・タグ生成エラー: {e}")
        return None, []


# -- メタデータをデータベースに保存 --------------
def update_article_metadata(conn, article_id: str, content: str, summary: str, tags: list[str]):
    try:
        cursor = conn.cursor()
        query = """
            UPDATE articles
            SET content = %s, summary = %s, tags = %s, metadata_generated = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """
        cursor.execute(query, (content, summary, tags, article_id))
        conn.commit()
        cursor.close()
        print(f"  更新成功")
    except Exception as e:
        conn.rollback()
        print(f"  更新エラー: {e}")


# -- 記事処理 --------------
def process_articles(conn, articles: list[dict]):
    processed_count = 0

    for article in articles:
        print(f"\n処理中: {article['title'][:50]}...")

        # 本文抽出
        article_text = get_article_text(article["url"])
        if not article_text:
            print(f"  本文取得失敗: スキップ")
            continue

        # 要約とタグ生成
        summary, tags = generate_summary_and_tags(article_text)
        if not summary:
            print(f"  要約生成失敗: スキップ")
            continue

        # データベース更新
        update_article_metadata(conn, article["id"], article_text, summary, tags)
        processed_count += 1

    print(f"\n\n処理完了: {processed_count}件の記事を処理")


# -- メイン処理 --------------
def main():
    print("Metadata Generator 開始")

    # DB接続
    conn = get_db_connection()
    print("データベース接続成功")

    # メタデータ未生成の記事取得
    articles = get_articles_without_metadata(conn)
    print(f"メタデータ未生成の記事: {len(articles)}件")

    if len(articles) == 0:
        print("処理対象の記事がありません")
        conn.close()
        return

    # 記事処理
    process_articles(conn, articles)

    # DB接続クローズ
    conn.close()
    print("\nMetadata Generator 完了")


if __name__ == "__main__":
    main()

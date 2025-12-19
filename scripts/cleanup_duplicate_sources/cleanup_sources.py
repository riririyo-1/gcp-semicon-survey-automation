#!/usr/bin/env python3
import os
import psycopg2

# -- データベース接続情報取得 --------------
DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")


# -- PostgreSQL接続 --------------
def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )


# -- 削除前の確認 --------------
def check_duplicate_sources(conn):
    cursor = conn.cursor()

    print("=== 削除対象の出典一覧 ===")
    query = """
        SELECT source, COUNT(*) as count
        FROM articles
        WHERE
            source IN (
                'ITmedia エグゼクティブ',
                'ITmedia エンタープライズ',
                'ITmedia ビジネスオンライン',
                'ITmedia Mobile',
                'ITmedia NEWS',
                'ITmedia PC USER'
            )
        GROUP BY source
        ORDER BY source
    """
    cursor.execute(query)
    results = cursor.fetchall()

    total_count = 0
    for source, count in results:
        print(f"  {source}: {count}件")
        total_count += count

    print(f"\n合計: {total_count}件\n")
    cursor.close()
    return total_count


# -- 不正な出典名の記事を削除 --------------
def cleanup_duplicate_sources(conn):
    cursor = conn.cursor()

    print("=== ITmedia関連の不正な出典名を削除 ===")
    query = """
        DELETE FROM articles
        WHERE source IN (
            'ITmedia エグゼクティブ',
            'ITmedia エンタープライズ',
            'ITmedia ビジネスオンライン',
            'ITmedia Mobile',
            'ITmedia NEWS',
            'ITmedia PC USER'
        )
    """
    cursor.execute(query)
    deleted_count = cursor.rowcount
    conn.commit()
    print(f"削除完了: {deleted_count}件\n")
    cursor.close()


# -- 削除後の確認 --------------
def check_all_sources(conn):
    cursor = conn.cursor()

    print("=== 全出典の一覧 ===")
    query = """
        SELECT source, COUNT(*) as count
        FROM articles
        GROUP BY source
        ORDER BY source
    """
    cursor.execute(query)
    results = cursor.fetchall()

    for source, count in results:
        print(f"  {source}: {count}件")

    cursor.close()


# -- メイン処理 --------------
def main():
    print("不正な出典名の記事削除スクリプト開始\n")

    # DB接続
    conn = get_db_connection()
    print("データベース接続成功\n")

    # 削除前の確認
    total_count = check_duplicate_sources(conn)

    if total_count == 0:
        print("削除対象の記事はありません。")
    else:
        # 削除実行
        cleanup_duplicate_sources(conn)

        # 削除後の確認
        check_all_sources(conn)

    # DB接続クローズ
    conn.close()
    print("\n削除スクリプト完了")


if __name__ == "__main__":
    main()

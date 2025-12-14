#!/usr/bin/env python3
"""
既存記事の出典名を正規化するスクリプト
"""
import os
import psycopg2
from dotenv import load_dotenv

# 環境変数読み込み
load_dotenv()

DB_HOST = os.environ.get("DB_HOST")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_PASSWORD = os.environ.get("DB_PASSWORD")


def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )


def show_current_sources(conn):
    """現在の出典を表示"""
    print("\n=== 現在の出典一覧 ===")
    cursor = conn.cursor()
    cursor.execute("""
        SELECT source, COUNT(*) as count 
        FROM articles 
        GROUP BY source 
        ORDER BY count DESC
    """)
    
    results = cursor.fetchall()
    for source, count in results:
        print(f"  {source}: {count}件")
    
    cursor.close()
    print(f"\n合計: {sum(row[1] for row in results)}件")


def normalize_sources(conn):
    """出典名を正規化"""
    cursor = conn.cursor()
    
    updates = [
        # ITmedia系を統一
        ("ITmedia", "ITmedia%", "ITmedia"),
        
        # マイナビ系を統一
        ("マイナビ Tech+", "マイナビ%", "マイナビ Tech+"),
        
        # 日経系を統一
        ("日経XTECH", "日経%", "日経XTECH"),
        ("日経XTECH", "TECH+%", None),  # TECH+系も日経XTECHに統一
    ]
    
    total_updated = 0
    
    for target, pattern, exclude in updates:
        if exclude:
            cursor.execute("""
                UPDATE articles 
                SET source = %s 
                WHERE source LIKE %s AND source != %s
                RETURNING id
            """, (target, pattern, exclude))
        else:
            cursor.execute("""
                UPDATE articles 
                SET source = %s 
                WHERE source LIKE %s
                RETURNING id
            """, (target, pattern))
        
        updated_count = cursor.rowcount
        if updated_count > 0:
            print(f"  '{pattern}' -> '{target}': {updated_count}件更新")
            total_updated += updated_count
    
    conn.commit()
    cursor.close()
    
    return total_updated


def main():
    print("出典名正規化スクリプト開始")
    print("=" * 50)
    
    # DB接続
    conn = get_db_connection()
    print("✓ データベース接続成功")
    
    # 現在の出典を表示
    show_current_sources(conn)
    
    # 正規化実行
    print("\n=== 出典名を正規化中 ===")
    updated = normalize_sources(conn)
    
    if updated > 0:
        print(f"\n✓ {updated}件の記事を更新しました")
        
        # 更新後の出典を表示
        show_current_sources(conn)
    else:
        print("\n更新対象の記事はありませんでした")
    
    # DB接続クローズ
    conn.close()
    print("\n出典名正規化スクリプト完了")


if __name__ == "__main__":
    main()

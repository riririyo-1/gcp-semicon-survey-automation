-- -- 不正な出典名の記事削除スクリプト --------------
--
-- 背景:
-- 過去の実装で、メタタグやURLから出典を取得していたため、
-- 同じサイトでもカテゴリによって異なる出典名が付与されていた。
-- 現在はrss_feeds.yamlの大項目（source_name）を使用するよう修正済み。
--
-- このスクリプトは、古い実装で作成された不正な出典名のレコードを削除する。


-- -- 削除前の確認 --------------

-- 削除対象の出典一覧と件数を表示
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
ORDER BY source;


-- -- 削除実行 --------------

-- ITmedia関連の不正な出典名を削除
DELETE FROM articles
WHERE source IN (
    'ITmedia エグゼクティブ',
    'ITmedia エンタープライズ',
    'ITmedia ビジネスオンライン',
    'ITmedia Mobile',
    'ITmedia NEWS',
    'ITmedia PC USER'
);


-- -- 削除後の確認 --------------

-- 全出典の一覧と件数を表示
SELECT source, COUNT(*) as count
FROM articles
GROUP BY source
ORDER BY source;

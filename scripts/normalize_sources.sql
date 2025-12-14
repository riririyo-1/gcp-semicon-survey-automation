-- 既存記事の出典名を正規化するSQLスクリプト

-- まず現在の出典を確認
SELECT source, COUNT(*) as count 
FROM articles 
GROUP BY source 
ORDER BY count DESC;

-- ITmedia系を統一
UPDATE articles 
SET source = 'ITmedia' 
WHERE source LIKE 'ITmedia%' AND source != 'ITmedia';

-- マイナビ系を統一  
UPDATE articles 
SET source = 'マイナビ Tech+' 
WHERE source LIKE 'マイナビ%' AND source != 'マイナビ Tech+';

-- 日経系を統一
UPDATE articles 
SET source = '日経XTECH' 
WHERE source LIKE '日経%' AND source != '日経XTECH';

-- TECH+系を統一
UPDATE articles 
SET source = '日経XTECH' 
WHERE source LIKE 'TECH+%';

-- 更新後の出典を確認
SELECT source, COUNT(*) as count 
FROM articles 
GROUP BY source 
ORDER BY count DESC;

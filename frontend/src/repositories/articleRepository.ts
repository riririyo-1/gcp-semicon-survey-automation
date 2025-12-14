import { getPool } from "@/lib/db";
import { Article } from "@/types/article";

// -- 記事一覧取得（ページネーション対応） --------------
export async function getArticles(
  source?: string,
  tag?: string,
  searchQuery?: string,
  date?: string,
  limit: number = 100,
  offset: number = 0
): Promise<Article[]> {
  try {
    const pool = await getPool();
    let query = `
      SELECT id, title, url, source, image_url, content, published_date, summary, tags, created_at, updated_at, metadata_generated
      FROM articles
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // フィルタリング条件
    if (source) {
      params.push(source);
      query += ` AND source = $${params.length}`;
    }

    if (tag) {
      params.push(`%${tag}%`);
      query += ` AND EXISTS (SELECT 1 FROM unnest(tags) AS t WHERE t ILIKE $${params.length})`;
    }

    if (searchQuery) {
      params.push(`%${searchQuery}%`);
      query += ` AND (title ILIKE $${params.length} OR EXISTS (SELECT 1 FROM unnest(tags) AS t WHERE t ILIKE $${params.length}))`;
    }

    if (date) {
      params.push(date);
      query += ` AND DATE(published_date) = $${params.length}`;
    }

    // ソート・リミット・オフセット
    query += ` ORDER BY published_date DESC NULLS LAST, created_at DESC`;

    params.push(limit);
    query += ` LIMIT $${params.length}`;

    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    return result.rows;
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    throw error;
  }
}

// -- 記事詳細取得 --------------
export async function getArticleById(id: string): Promise<Article | null> {
  const pool = await getPool();
  const query = `
    SELECT id, title, url, source, image_url, content, published_date, summary, tags, created_at, updated_at, metadata_generated
    FROM articles
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

// -- すべての出典を取得 --------------
export async function getSources(): Promise<string[]> {
  try {
    const pool = await getPool();
    const query = `
      SELECT DISTINCT source
      FROM articles
      WHERE source IS NOT NULL
      ORDER BY source
    `;
    const result = await pool.query(query);

    return result.rows.map((row) => row.source);
  } catch (error) {
    console.error("Failed to fetch sources:", error);
    return [];
  }
}

// -- すべてのタグを取得 --------------
export async function getTags(): Promise<string[]> {
  try {
    const pool = await getPool();
    const query = `
      SELECT DISTINCT unnest(tags) as tag
      FROM articles
      WHERE tags IS NOT NULL
      ORDER BY tag
    `;
    const result = await pool.query(query);

    return result.rows.map((row) => row.tag);
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    return [];
  }
}

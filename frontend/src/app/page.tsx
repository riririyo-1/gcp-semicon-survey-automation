import { ArticleCard } from "@/components/ArticleCard";
import { FilterPanel } from "@/components/FilterPanel";
import {
  getArticles,
  getAllSources,
  getAllTags,
} from "@/repositories/articleRepository";

// 動的レンダリングを強制
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface PageProps {
  params: Promise<Record<string, never>>;
  searchParams: SearchParams;
}

// -- メインページ --------------
export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams;
  const source =
    typeof searchParams.source === "string" ? searchParams.source : undefined;
  const tag =
    typeof searchParams.tag === "string" ? searchParams.tag : undefined;

  // データ取得
  const [articles, sources, tags] = await Promise.all([
    getArticles(source, tag, 50),
    getAllSources(),
    getAllTags(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            半導体業界サーベイ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            半導体業界の最新ニュースとトレンドを自動収集・要約
          </p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* フィルタパネル */}
          <aside className="lg:col-span-1">
            <FilterPanel sources={sources} tags={tags} />
          </aside>

          {/* 記事一覧 */}
          <section className="lg:col-span-3">
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {articles.length}件の記事
              {source && ` （出典: ${source}）`}
              {tag && ` （タグ: ${tag}）`}
            </div>

            {articles.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  記事が見つかりませんでした
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          © 2025 半導体業界サーベイ. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

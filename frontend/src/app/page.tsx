import { InfiniteScrollList } from "@/components/InfiniteScrollList";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PageHeader } from "@/components/PageHeader";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Article } from "@/types/article";
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

  // データ取得（初回100件）
  let articles: Article[] = [];
  let sources: string[] = [];
  let tags: string[] = [];
  let hasError = false;

  try {
    const results = await Promise.all([
      getArticles(source, tag, 100, 0),
      getAllSources(),
      getAllTags(),
    ]);
    articles = results[0];
    sources = results[1];
    tags = results[2];
  } catch (error) {
    console.error("Failed to load data:", error);
    hasError = true;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      {/* ヘッダー */}
      <PageHeader />

      {/* メインコンテンツ */}
      <main className="flex-grow flex">
        {/* フィルターサイドバー */}
        <FilterSidebar sources={sources} tags={tags} />

        {/* 記事一覧 */}
        <section className="flex-grow ml-16 px-6 py-8 transition-all duration-300">
          {hasError ? (
            <ErrorMessage />
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {articles.length}件の記事を表示中
                {source && ` （出典: ${source}）`}
                {tag && ` （タグ: ${tag}）`}
              </div>

              <InfiniteScrollList
                initialArticles={articles}
                source={source}
                tag={tag}
              />
            </>
          )}
        </section>
      </main>

      {/* フッター */}
      <footer className="relative z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="w-full px-6 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          半導体動向調査 TOPICS配信チーム
        </div>
      </footer>
    </div>
  );
}

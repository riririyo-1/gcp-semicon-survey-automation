import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleById } from "@/repositories/articleRepository";
import { PageHeader } from "@/components/PageHeader";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ArticlePage(props: Props) {
  const params = await props.params;
  const { id } = params;
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  // Format date helper (local to server component, or could import utils)
  const formattedDate = article.published_date
    ? new Date(article.published_date).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "日付不明";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <PageHeader />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          記事一覧に戻る
        </Link>

        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header Image */}
          {article.image_url && (
            <div className="relative w-full aspect-video md:aspect-[21/9]">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {article.source}
              </span>
              <span>•</span>
              <time dateTime={article.published_date || ""}>
                {formattedDate}
              </time>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Summary/Content */}
            <div className="prose dark:prose-invert max-w-none mb-8">
              <h3 className="text-lg font-bold mb-2">要約</h3>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {article.summary ||
                  article.content ||
                  "この記事には要約がありません。"}
              </p>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-center">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
              >
                <span>元の記事を読む</span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

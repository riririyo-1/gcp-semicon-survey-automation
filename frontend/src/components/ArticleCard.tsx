"use client";

import Image from "next/image";
import Link from "next/link";
import { Article } from "@/types/article";
import { useTranslation } from "@/hooks/useTranslation";


interface ArticleCardProps {
  article: Article;
}


// -- 記事カードコンポーネント --------------
export function ArticleCard({ article }: ArticleCardProps) {
  const { t, locale } = useTranslation();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t("article.publishedOn");
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* トップ画像 */}
      <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">{t("article.noImage")}</span>
          </div>
        )}
      </div>

      {/* 記事情報 */}
      <div className="p-4">
        {/* タイトル */}
        <h2 className="text-xl font-bold mb-2 line-clamp-2">
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            {article.title}
          </Link>
        </h2>

        {/* 出典と日付 */}
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="font-medium">{article.source}</span>
          <span>•</span>
          <span>{formatDate(article.published_date)}</span>
        </div>

        {/* 要約 */}
        {article.summary && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-3">
            {article.summary}
          </p>
        )}

        {/* タグ */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {article.tags.length > 5 && (
              <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded">
                +{article.tags.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

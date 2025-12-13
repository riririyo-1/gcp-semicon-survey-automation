"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Article } from "@/types/article";
import { useTranslation } from "@/hooks/useTranslation";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { t, locale } = useTranslation();
  const router = useRouter();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t("article.publishedOn") || "Published";
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleCardClick = () => {
    router.push(`/articles/${article.id}`);
  };

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(article.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 dark:border-gray-700 flex flex-col h-full"
    >
      {/* Top Section: Image & Meta */}
      <div className="relative w-full aspect-video sm:aspect-[2/1] bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Date & Source Badge (Overlay) */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          <span className="bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
            {formatDate(article.published_date)}
          </span>
          <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
            {article.source}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Categories (if present) */}
        <div className="flex gap-2 mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          {article.major_category && (
            <span className="px-2 py-0.5 border border-gray-200 dark:border-gray-600 rounded-full">
              {article.major_category}
            </span>
          )}
          {article.minor_category && (
            <span className="px-2 py-0.5 border border-gray-200 dark:border-gray-600 rounded-full">
              {article.minor_category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 flex-grow">
          {article.summary || t("article.noSummary")}
        </p>

        {/* Footer: Tags & Actions */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
          {/* Tags */}
          <div className="flex gap-1 flex-wrap overflow-hidden h-6">
            {article.tags?.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* External Link Button */}
          <button
            onClick={handleExternalLinkClick}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
            title={t("article.openExternal") || "Open original"}
            aria-label="Open original article"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>
      </div>
    </div>
  );
}

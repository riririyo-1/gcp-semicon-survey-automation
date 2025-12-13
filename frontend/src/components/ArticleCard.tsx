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
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg border border-white/50 dark:border-white/10 shadow-sm flex flex-col h-full backdrop-blur-md bg-white/70 dark:bg-slate-800/70"
    >
      {/* Image Section */}
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

        {/* Link Button Overlay (Top Right) */}
        <button
          onClick={handleExternalLinkClick}
          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm z-10"
          title={t("article.openExternal") || "Open original"}
        >
          <svg
            className="w-4 h-4"
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

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Categories */}
        <div className="flex gap-2 mb-2">
          {article.major_category && (
            <span className="px-2 py-0.5 text-[10px] font-medium border border-gray-300 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-300">
              {article.major_category}
            </span>
          )}
          {article.minor_category && (
            <span className="px-2 py-0.5 text-[10px] font-medium border border-gray-300 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-300">
              {article.minor_category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {article.title}
        </h3>

        {/* Summary (Dense) */}
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-grow leading-relaxed">
          {article.summary || t("article.noSummary")}
        </p>

        {/* Footer: Tags & Meta */}
        <div className="mt-auto pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col gap-2">
            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap overflow-hidden h-5">
                {article.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta: Source & Date */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
              <span className="font-medium flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
                {article.source}
              </span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(article.published_date)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

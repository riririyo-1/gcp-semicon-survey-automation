"use client";

import { useState, useEffect, useCallback } from "react";
import { Article } from "@/types/article";
import { ArticleCard } from "./ArticleCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useTranslation } from "@/hooks/useTranslation";

interface InfiniteScrollListProps {
  initialArticles: Article[];
  source?: string;
  tag?: string;
}

// -- InfiniteScrollList --------------
export function InfiniteScrollList({
  initialArticles,
  source,
  tag,
}: InfiniteScrollListProps) {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [offset, setOffset] = useState(initialArticles.length);
  const [hasMore, setHasMore] = useState(initialArticles.length === 100);
  const [isLoading, setIsLoading] = useState(false);

  // フィルター変更時に記事をリセット
  useEffect(() => {
    setArticles(initialArticles);
    setOffset(initialArticles.length);
    setHasMore(initialArticles.length === 100);
  }, [initialArticles]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: "100",
      });

      if (source) params.append("source", source);
      if (tag) params.append("tag", tag);

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        setArticles((prev) => [...prev, ...data.articles]);
        setOffset((prev) => prev + data.articles.length);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more articles:", error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [offset, isLoading, hasMore, source, tag]);

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {t("article.noArticles")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Intersection Observer Sentinel */}
      <div ref={sentinelRef} className="h-20 flex items-center justify-center">
        {isLoading && (
          <div className="text-gray-500 dark:text-gray-400">
            {t("article.loading")}
          </div>
        )}
      </div>

      {!hasMore && articles.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {t("article.noMore")}
          </p>
        </div>
      )}
    </div>
  );
}

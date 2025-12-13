"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

interface FilterPanelProps {
  sources: string[];
  tags: string[];
}

// -- フィルタパネルコンポーネント --------------
export function FilterPanel({ sources, tags }: FilterPanelProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSource = searchParams.get("source") || "";
  const currentTag = searchParams.get("tag") || "";

  const handleSourceChange = (source: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (source) {
      params.set("source", source);
    } else {
      params.delete("source");
    }
    router.push(`/?${params.toString()}`);
  };

  const handleTagChange = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }
    router.push(`/?${params.toString()}`);
  };

  const handleReset = () => {
    router.push("/");
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
        {t("filter.title")}
      </h2>

      {/* 出典フィルタ */}
      <div className="mb-4">
        <label
          htmlFor="source"
          className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
        >
          {t("article.source")}
        </label>
        <select
          id="source"
          value={currentSource}
          onChange={(e) => handleSourceChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">{t("filter.allSources")}</option>
          {sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>

      {/* タグフィルタ */}
      <div className="mb-4">
        <label
          htmlFor="tag"
          className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
        >
          {t("article.tags")}
        </label>
        <select
          id="tag"
          value={currentTag}
          onChange={(e) => handleTagChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">{t("filter.allTags")}</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* リセットボタン */}
      {(currentSource || currentTag) && (
        <button
          onClick={handleReset}
          className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {t("filter.clearFilters")}
        </button>
      )}
    </div>
  );
}

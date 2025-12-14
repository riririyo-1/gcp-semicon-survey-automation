"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

interface SearchHeaderProps {
  sources: string[];
}

export function SearchHeader({ sources }: SearchHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedSource, setSelectedSource] = useState(
    searchParams.get("source") || ""
  );
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("date") || ""
  );

  // Update local state when URL params change
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setSelectedSource(searchParams.get("source") || "");
    setSelectedDate(searchParams.get("date") || "");
  }, [searchParams]);

  const applyFilters = (
    updates: Partial<{
      q: string;
      source: string;
      date: string;
    }>
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    // Merge current state with updates
    const newState = {
      q: updates.q !== undefined ? updates.q : searchQuery,
      source: updates.source !== undefined ? updates.source : selectedSource,
      date: updates.date !== undefined ? updates.date : selectedDate,
    };

    if (newState.q) params.set("q", newState.q);
    else params.delete("q");
    if (newState.source) params.set("source", newState.source);
    else params.delete("source");
    if (newState.date) params.set("date", newState.date);
    else params.delete("date");

    router.push(`/?${params.toString()}`);
  };

  const handleSearch = () => {
    applyFilters({ q: searchQuery });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-white/10 shadow-sm transition-colors">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {/* Search Bar and Button - スマホでは縦、PCでは横 */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={
                  t("filter.searchPlaceholder") || "タイトルまたはタグで検索..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                aria-label="Search articles"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <button
              onClick={handleSearch}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>{t("filter.search") || "Search"}</span>
            </button>
          </div>

          {/* Filters - 日付と出典を横並び */}
          <div className="flex gap-3 items-center">
            {/* Date Filter with Reset Button */}
            <div className="flex-1 flex gap-2 items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  applyFilters({ date: e.target.value });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
                aria-label="Filter by date"
              />
              {selectedDate && (
                <button
                  onClick={() => {
                    setSelectedDate("");
                    applyFilters({ date: "" });
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label="Clear date filter"
                  title="日付をクリア"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                applyFilters({ source: e.target.value });
              }}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
              aria-label="Filter by source"
            >
              <option value="">{t("filter.Sources") || "All Sources"}</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

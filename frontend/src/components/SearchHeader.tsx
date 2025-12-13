"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

interface SearchHeaderProps {
  sources: string[];
  tags: string[];
}

export function SearchHeader({ sources, tags }: SearchHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedSource, setSelectedSource] = useState(
    searchParams.get("source") || ""
  );
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag") || "");
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("date") || ""
  );
  const [selectedMajorCategory, setSelectedMajorCategory] = useState(
    searchParams.get("major_category") || ""
  );
  const [selectedMinorCategory, setSelectedMinorCategory] = useState(
    searchParams.get("minor_category") || ""
  );

  // Update local state when URL params change
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setSelectedSource(searchParams.get("source") || "");
    setSelectedTag(searchParams.get("tag") || "");
    setSelectedDate(searchParams.get("date") || "");
    setSelectedMajorCategory(searchParams.get("major_category") || "");
    setSelectedMinorCategory(searchParams.get("minor_category") || "");
  }, [searchParams]);

  const applyFilters = (
    updates: Partial<{
      q: string;
      source: string;
      tag: string;
      date: string;
      major_category: string;
      minor_category: string;
    }>
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    // Merge current state with updates
    const newState = {
      q: updates.q !== undefined ? updates.q : searchQuery,
      source: updates.source !== undefined ? updates.source : selectedSource,
      tag: updates.tag !== undefined ? updates.tag : selectedTag,
      date: updates.date !== undefined ? updates.date : selectedDate,
      major_category:
        updates.major_category !== undefined
          ? updates.major_category
          : selectedMajorCategory,
      minor_category:
        updates.minor_category !== undefined
          ? updates.minor_category
          : selectedMinorCategory,
    };

    if (newState.q) params.set("q", newState.q);
    else params.delete("q");
    if (newState.source) params.set("source", newState.source);
    else params.delete("source");
    if (newState.tag) params.set("tag", newState.tag);
    else params.delete("tag");
    if (newState.date) params.set("date", newState.date);
    else params.delete("date");
    if (newState.major_category)
      params.set("major_category", newState.major_category);
    else params.delete("major_category");
    if (newState.minor_category)
      params.set("minor_category", newState.minor_category);
    else params.delete("minor_category");

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
    <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {/* Top Row: Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={
                  t("filter.searchPlaceholder") || "Search articles..."
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
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span>{t("filter.search") || "Search"}</span>
            </button>
          </div>

          {/* Bottom Row: Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Date Filter */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                applyFilters({ date: e.target.value });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100"
              aria-label="Filter by date"
            />

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => {
                setSelectedSource(e.target.value);
                applyFilters({ source: e.target.value });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm max-w-[150px] text-gray-900 dark:text-gray-100"
              aria-label="Filter by source"
            >
              <option value="">{t("filter.Sources") || "All Sources"}</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            {/* Tag Filter */}
            <select
              value={selectedTag}
              onChange={(e) => {
                setSelectedTag(e.target.value);
                applyFilters({ tag: e.target.value });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm max-w-[150px] text-gray-900 dark:text-gray-100"
              aria-label="Filter by tag"
            >
              <option value="">{t("filter.Tags") || "All Tags"}</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            {/* Major Category (Placeholder) */}
            <select
              value={selectedMajorCategory}
              onChange={(e) => {
                setSelectedMajorCategory(e.target.value);
                applyFilters({ major_category: e.target.value });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm max-w-[150px] text-gray-900 dark:text-gray-100"
              aria-label="Filter by major category"
            >
              <option value="">{t("filter.majorCategory")}</option>
            </select>

            {/* Minor Category (Placeholder) */}
            <select
              value={selectedMinorCategory}
              onChange={(e) => {
                setSelectedMinorCategory(e.target.value);
                applyFilters({ minor_category: e.target.value });
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm max-w-[150px] text-gray-900 dark:text-gray-100"
              aria-label="Filter by minor category"
            >
              <option value="">{t("filter.minorCategory")}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { FilterPanel } from "./FilterPanel";
import { useTranslation } from "@/hooks/useTranslation";


interface FilterSidebarProps {
  sources: string[];
  tags: string[];
}


// -- フィルターサイドバーコンポーネント --------------
export function FilterSidebar({ sources, tags }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed left-0 z-30
          top-[89px] bottom-[73px]
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-80" : "w-16"}
          bg-white dark:bg-gray-800 shadow-lg
          border-r border-gray-200 dark:border-gray-700
          flex flex-col
        `}
      >
        {/* ハンバーガーメニューボタン */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center
            h-16 w-full
            text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-700
            transition-colors duration-200
            border-b border-gray-200 dark:border-gray-700
            ${isOpen ? "justify-end pr-4" : "justify-center"}
          `}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* サイドバーコンテンツ */}
        <div
          className={`
            flex-grow overflow-hidden
            transition-opacity duration-300
            ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
        >
          {isOpen && (
            <div className="h-full overflow-y-auto p-4">
              <FilterPanel sources={sources} tags={tags} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

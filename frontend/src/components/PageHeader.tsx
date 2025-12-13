"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";


// -- ページヘッダーコンポーネント --------------
export function PageHeader() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="w-full px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t("app.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t("app.description")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}

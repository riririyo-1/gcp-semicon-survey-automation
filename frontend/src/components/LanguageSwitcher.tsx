"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { locales, localeNames } from "@/i18n/config";

// -- LanguageSwitcher --------------
export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as "en" | "ja")}
      className="px-3 py-1.5 rounded-md text-sm font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600"
      aria-label="Select language"
    >
      {locales.map((lang) => (
        <option key={lang} value={lang}>
          {localeNames[lang]}
        </option>
      ))}
    </select>
  );
}

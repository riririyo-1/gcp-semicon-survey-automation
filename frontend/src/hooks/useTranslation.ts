"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslations, getNestedTranslation } from "@/i18n";

// -- useTranslation hook --------------
export function useTranslation() {
  const { locale } = useLanguage();
  const translations = getTranslations(locale);

  const t = (key: string): string => {
    return getNestedTranslation(translations, key);
  };

  return { t, locale };
}

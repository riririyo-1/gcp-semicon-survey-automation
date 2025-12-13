import type { Locale } from "./config";
import enCommon from "./en/common.json";
import jaCommon from "./ja/common.json";

const translations = {
  en: { common: enCommon },
  ja: { common: jaCommon },
} as const;

export type TranslationKeys = typeof translations.ja.common;

// -- 翻訳取得関数 --------------
export function getTranslations(locale: Locale) {
  return translations[locale].common;
}

// -- ネストされたキーから値を取得 --------------
export function getNestedTranslation(
  obj: any,
  path: string
): string {
  return path.split(".").reduce((current, key) => current?.[key], obj) || path;
}


// -- サーバーサイド用翻訳関数 --------------
export function getServerTranslation(locale: Locale, key: string): string {
  const t = getTranslations(locale);
  return getNestedTranslation(t, key);
}

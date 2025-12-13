export const defaultLocale = "ja" as const;
export const locales = ["en", "ja"] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
};

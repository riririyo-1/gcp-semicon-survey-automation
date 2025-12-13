"use client";

import { useTranslation } from "@/hooks/useTranslation";


interface ErrorMessageProps {
  onRetry?: () => void;
}


// -- エラーメッセージコンポーネント --------------
export function ErrorMessage({ onRetry }: ErrorMessageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
            {t("article.error")}
          </h3>
        </div>
        <p className="text-red-700 dark:text-red-300 mb-4">
          {t("article.error")}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-md transition-colors font-medium"
          >
            {t("article.retry")}
          </button>
        )}
      </div>
    </div>
  );
}

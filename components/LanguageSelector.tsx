"use client";

import { useLanguage } from '@/lib/LanguageContext';
import { Language } from '@/lib/translations';

export default function LanguageSelector() {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  return (
    <div className="relative main-component">
      <label htmlFor="language-select" className="block text-sm font-medium text-white text-shadow mb-1">
        {t('language')}
      </label>
      <div className="relative">
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="block w-full pl-10 pr-3 py-2 border-none rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {Object.entries(availableLanguages).map(([code, lang]) => (
            <option key={code} value={code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z" />
          </svg>
        </span>
      </div>
    </div>
  );
}
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { useState } from 'react';

const languages = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-button bg-soft-sand hover:bg-latte text-espresso transition-colors"
      >
        <Languages className="w-4 h-4" />
        <span className="font-medium uppercase">{i18n.language}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 bg-white rounded-button shadow-lg border border-soft-sand z-50 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`block w-full text-left px-6 py-3 hover:bg-soft-sand transition-colors ${
                  i18n.language === lang.code
                    ? 'bg-latte text-espresso font-semibold'
                    : 'text-taupe'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

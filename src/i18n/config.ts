import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './locales/uz.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

const resources = {
  uz: { translation: uz },
  ru: { translation: ru },
  en: { translation: en },
};

// Get stored language or default to Uzbek
const storedLanguage = localStorage.getItem('language') || 'uz';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: storedLanguage,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false,
    },
  });

// Store language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('language', lng);
});

export default i18n;

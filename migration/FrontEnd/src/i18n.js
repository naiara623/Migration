import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/TranslationEn.json';
import translationES from './locales/TranslationEs.json';
import translationPT from './locales/TranslationPt.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: translationPT },
      en: { translation: translationEN },
      es: { translation: translationES }
    },
    lng: 'pt', // idioma inicial
    fallbackLng: 'pt',
    interpolation: { escapeValue: false }
  });

export default i18n;

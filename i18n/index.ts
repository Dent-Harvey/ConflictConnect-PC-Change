import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import cs from './locales/cs.json';
import en from './locales/en.json';
import fa from './locales/fa.json';
import he from './locales/he.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';
import uk from './locales/uk.json';

const resources = {
  en: { translation: en },
  cs: { translation: cs }, // Czech
  ru: { translation: ru }, // Russian
  uk: { translation: uk }, // Ukrainian
  he: { translation: he }, // Hebrew
  ar: { translation: ar }, // Arabic
  fa: { translation: fa }, // Persian/Farsi
  tr: { translation: tr }, // Turkish
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0]?.languageCode || 'en',
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
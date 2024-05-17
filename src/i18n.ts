import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import es from '@/locales/es.json';

import { createI18n } from 'vue-i18n';

const supportedLanguages = ['en', 'ru', 'es'] as const;

type SupportedLanguage = typeof supportedLanguages[number];

const fallbackLocale: SupportedLanguage = 'en';

const getSupportedLanguage = (): SupportedLanguage => {
  const browserLanguage = navigator.language.split('-')[0] as SupportedLanguage;
  return supportedLanguages.includes(browserLanguage) ? browserLanguage : fallbackLocale;
};

const locale = getSupportedLanguage();

const i18n = createI18n({
  messages: {
    en,
    ru,
    es,
  },
  locale,
  fallbackLocale,
});

export default i18n;

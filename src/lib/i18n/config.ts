import i18next from 'i18next';
import i18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'
import i18nextHttpBackend from 'i18next-http-backend'
import * as i18nextReact from 'react-i18next';

import { resources } from './resources';

export const supportedLanguages: { id: string; name: string }[] = [
  {
    id: 'en-US',
    name: 'common:languages.enUS',
  },
  {
    id: 'pt-BR',
    name: 'common:languages.ptBR',
  },
  {
    id: 'pt-PT',
    name: 'common:languages.ptPT',
  },
  {
    id: 'es-ES',
    name: 'common:languages.esES',
  },
]

export const LANGUAGE_TOKEN = '@trackgeek/language';

export const DEFAULT_LANGUAGE = supportedLanguages[0].id;

i18next
  .use(i18nextHttpBackend)
  .use(i18nextBrowserLanguageDetector)
  .use(i18nextReact.initReactI18next)
  .init({
    resources,
    supportedLngs: supportedLanguages.map(lang => lang.id),
    lng: window.localStorage.getItem(LANGUAGE_TOKEN) ?? DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
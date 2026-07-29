import i18next, { type BackendModule, type ReadCallback, type Resource } from "i18next";
import { Cookies } from "react-cookie";
import * as i18nextReact from "react-i18next";

type LocaleModule = { default: Record<string, unknown> };

const localeLoaders = import.meta.glob<LocaleModule>("./locales/**/*.json");

const defaultLocaleModules = import.meta.glob<LocaleModule>("./locales/en-US/*.json", { eager: true });

export const LANGUAGE_TOKEN = "trackgeek-language";

export const DEFAULT_LANGUAGE = "en-US";

const localeKey = (language: string, namespace: string) => `./locales/${language}/${namespace}.json`;

export const SUPPORTED_LANGUAGES = [...new Set(Object.keys(localeLoaders).map((path) => path.split("/")[2]))]
  .sort()
  .map((language) => ({
    id: language,
    name: `common:languages.${language.replace("-", "")}`,
  }));

export const NAMESPACES = Object.keys(defaultLocaleModules).map((path) => path.split("/")[3].replace(".json", ""));

const defaultResources: Resource = {
  [DEFAULT_LANGUAGE]: Object.fromEntries(
    Object.entries(defaultLocaleModules).map(([path, module]) => [
      path.split("/")[3].replace(".json", ""),
      module.default,
    ]),
  ),
};

const localeBackend: BackendModule = {
  type: "backend",
  init: () => {},
  read: (language: string, namespace: string, callback: ReadCallback) => {
    const loader = localeLoaders[localeKey(language, namespace)];

    if (!loader) {
      callback(null, {});
      return;
    }

    loader()
      .then((module) => callback(null, module.default))
      .catch((error) => callback(error as Error, false));
  },
};

export function isSupportedLanguage(language: string | null | undefined): language is string {
  return !!language && SUPPORTED_LANGUAGES.some(({ id }) => id === language);
}

const cookies = new Cookies(null, { path: "/" });

export function getClientLanguage() {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  const fromCookie = cookies.get<string>(LANGUAGE_TOKEN);

  if (isSupportedLanguage(fromCookie)) {
    return fromCookie;
  }

  const fromStorage = window.localStorage.getItem(LANGUAGE_TOKEN);

  if (isSupportedLanguage(fromStorage)) {
    setLanguageCookie(fromStorage);

    return fromStorage;
  }

  return DEFAULT_LANGUAGE;
}

export function setLanguageCookie(language: string) {
  if (typeof document === "undefined") {
    return;
  }

  cookies.set(LANGUAGE_TOKEN, language, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}

i18next
  .use(localeBackend)
  .use(i18nextReact.initReactI18next)
  .init({
    resources: defaultResources,
    partialBundledLanguages: true,
    ns: NAMESPACES,
    defaultNS: "common",
    supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.id),
    lng: getClientLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;

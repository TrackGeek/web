import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie, getRequestHeader } from "@tanstack/react-start/server";
import { isSupportedLanguage, LANGUAGE_TOKEN } from "@/lib/i18n/config";

interface ApiRequestContext {
  cookie?: string;
  language?: string;
}

export const getApiRequestContext = createIsomorphicFn()
  .server((): ApiRequestContext => {
    try {
      const language = getCookie(LANGUAGE_TOKEN);
      return {
        cookie: getRequestHeader("cookie"),
        language: isSupportedLanguage(language) ? language : undefined,
      };
    } catch {
      return {};
    }
  })
  .client((): ApiRequestContext => ({}));

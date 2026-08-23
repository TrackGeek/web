import { isAxiosError } from "axios";
import type { TFunction } from "i18next";

export function apiErrorMessage(t: TFunction, error: unknown, fallbackKey = "api:INTERNAL_SERVER_ERROR"): string {
  const code = isAxiosError(error) ? (error.response?.data as { code?: string } | undefined)?.code : undefined;

  return code ? t(`api:${code}`, { defaultValue: t(fallbackKey) }) : t(fallbackKey);
}

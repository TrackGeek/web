import type { TFunction } from "i18next";

/**
 * Convert the status name to camelCase
 * @example
 * formatStatusKey("Ended") => "ended"
 * formatStatusKey("Currently Airing") => "currentlyAiring"
 */
export function formatStatusKey(statusName: string): string {
  const words = statusName.split(" ");
  const formatted = words
    .map((word, index) => {
      if (index === 0) {
        return word.charAt(0).toLowerCase() + word.slice(1);
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");

  return formatted;
}

/**
 * Get the status label with fallback to the original name
 * @example
 * getStatusLabel(t, "Currently Airing") => "Currently Airing" (if found) or "Currently Airing" (fallback)
 */
export function getStatusLabel(t: TFunction<"translation", undefined>, statusName: string): string {
  const statusKey = formatStatusKey(statusName);
  const translationKey = `library:statussList.${statusKey}`;

  return t(translationKey, statusName);
}

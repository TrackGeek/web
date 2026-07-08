import type { TFunction } from "i18next";

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

export function getStatusLabel(t: TFunction<"translation", undefined>, statusName: string): string {
  const statusKey = formatStatusKey(statusName);
  const translationKey = `library:statusAir.${statusKey}`;

  return t(translationKey, statusName);
}

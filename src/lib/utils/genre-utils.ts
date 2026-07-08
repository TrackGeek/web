import type { TFunction } from "i18next";

export function formatGenreKey(genreName: string): string {
  const words = genreName.split(" ");
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

export function getGenreLabel(t: TFunction<"translation", undefined>, genreName: string): string {
  const genreKey = formatGenreKey(genreName);
  const translationKey = `library:genresList.${genreKey}`;

  return t(translationKey, genreName);
}

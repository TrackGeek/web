import type { ContentType } from "@/components/layouts/filters";

const CONTENT_TYPES: { value: ContentType; labelKey: string }[] = [
  { value: "movie", labelKey: "common:types.movie" },
  { value: "tv", labelKey: "common:types.tv" },
  { value: "game", labelKey: "common:types.game" },
  { value: "anime", labelKey: "common:types.anime" },
  { value: "manga", labelKey: "common:types.manga" },
  { value: "book", labelKey: "common:types.book" },
];

export type SearchType = ContentType | "user" | "cast";

export const SEARCH_TYPES: { value: SearchType; labelKey: string }[] = [
  ...CONTENT_TYPES,
  { value: "cast", labelKey: "common:types.cast" },
  { value: "user", labelKey: "common:profile" },
];

export const NON_CONTENT_SEARCH_TYPES: SearchType[] = ["user", "cast"];

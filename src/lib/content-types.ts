import type { ApiTypes } from "@/lib/api";

export type ContentTypeSlug = ApiTypes.ReviewContentType;

export const CONTENT_TYPE_SLUGS: ContentTypeSlug[] = ["movie", "tv", "game", "anime", "manga", "book"];

export const CONTENT_TYPE_API: Record<ContentTypeSlug, ApiTypes.ContentType> = {
  movie: "Movie",
  tv: "TVShow",
  game: "Game",
  anime: "Anime",
  manga: "Manga",
  book: "Book",
};

const SLUG_BY_API = Object.fromEntries(
  CONTENT_TYPE_SLUGS.map((slug) => [CONTENT_TYPE_API[slug], slug]),
) as Record<ApiTypes.ContentType, ContentTypeSlug>;

export const CONTENT_TYPE_LABELS: Record<ContentTypeSlug, string> = {
  movie: "common:types.movie_other",
  tv: "common:types.tv_other",
  game: "common:types.game_other",
  anime: "common:types.anime_other",
  manga: "common:types.manga_other",
  book: "common:types.book_other",
};

export const CONTENT_TYPE_ICONS: Record<ContentTypeSlug, string> = {
  movie: "lucide:clapperboard",
  tv: "lucide:tv-minimal-play",
  game: "lucide:gamepad-2",
  anime: "lucide:mountain",
  manga: "lucide:library-big",
  book: "lucide:book",
};

export function toContentTypeSlug(value: string): ContentTypeSlug | null {
  return SLUG_BY_API[value as ApiTypes.ContentType] ?? null;
}

import { api, apiEndpoints } from "@/lib/api";
import type { MediaCardProps } from "@/lib/og/templates/media";

export const OG_MEDIA_TYPES = ["movie", "tv", "anime", "manga", "book", "game"] as const;

export type OgMediaType = (typeof OG_MEDIA_TYPES)[number];

export function isOgMediaType(value: string): value is OgMediaType {
  return (OG_MEDIA_TYPES as readonly string[]).includes(value);
}

type RawMedia = Record<string, any>;

interface MediaSource {
  endpoint: (slug: string) => string;
  envelope: string;
  kindLabel: string;
  toCard: (raw: RawMedia) => Omit<MediaCardProps, "kindLabel">;
}

function yearOf(value: unknown) {
  if (typeof value === "number" && value > 0) return String(value);
  if (typeof value !== "string" || !value) return null;

  const parsed = new Date(value);

  if (!Number.isNaN(parsed.getTime())) return String(parsed.getFullYear());

  return value.match(/\d{4}/)?.[0] ?? null;
}

function names(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => (typeof entry === "string" ? entry : entry?.name))
    .filter((name): name is string => typeof name === "string" && !!name)
    .slice(0, limit);
}

function facts(...parts: (string | null | undefined)[]) {
  return parts.filter((part): part is string => !!part);
}

const SOURCES: Record<OgMediaType, MediaSource> = {
  movie: {
    endpoint: apiEndpoints.getMovieDetails,
    envelope: "movie",
    kindLabel: "Movie",
    toCard: (movie) => ({
      title: movie.title,
      year: yearOf(movie.releaseDate),
      facts: facts(...names(movie.genres, 2), movie.runtime > 0 ? `${movie.runtime} min` : null),
      description: movie.overview,
      score: movie.tgReviewScore,
      posterUrl: movie.posterUrl,
    }),
  },
  tv: {
    endpoint: apiEndpoints.getTvShowDetails,
    envelope: "tvShow",
    kindLabel: "TV Show",
    toCard: (show) => ({
      title: show.name,
      year: yearOf(show.firstAirDate),
      facts: facts(
        ...names(show.genres, 2),
        show.numberOfSeasons > 0 ? `${show.numberOfSeasons} season${show.numberOfSeasons > 1 ? "s" : ""}` : null,
      ),
      description: show.overview ?? show.tagline,
      score: show.tgReviewScore,
      posterUrl: show.posterUrl,
    }),
  },
  anime: {
    endpoint: apiEndpoints.getAnimeDetails,
    envelope: "anime",
    kindLabel: "Anime",
    toCard: (anime) => ({
      title: anime.title,
      year: yearOf(anime.year),
      facts: facts(...names(anime.genres, 2), anime.episodes > 0 ? `${anime.episodes} eps` : null),
      description: anime.synopsis,
      score: anime.tgReviewScore,
      posterUrl: anime.imageUrl,
    }),
  },
  manga: {
    endpoint: apiEndpoints.getMangaDetails,
    envelope: "manga",
    kindLabel: "Manga",
    toCard: (manga) => ({
      title: manga.title,
      year: yearOf(manga.published?.string),
      facts: facts(...names(manga.genres, 2), manga.chapters > 0 ? `${manga.chapters} chapters` : null),
      description: manga.synopsis,
      score: manga.tgReviewScore,
      posterUrl: manga.imageUrl,
    }),
  },
  book: {
    endpoint: apiEndpoints.getBookDetails,
    envelope: "book",
    kindLabel: "Book",
    toCard: (book) => ({
      title: book.title,
      year: yearOf(book.releaseDate ?? book.releaseYear),
      facts: facts(
        ...names(
          (book.contributions ?? []).map((contribution: RawMedia) => contribution?.author),
          1,
        ),
        book.numberOfPages > 0 ? `${book.numberOfPages} pages` : null,
      ),
      description: book.description,
      score: book.tgReviewScore,
      posterUrl: typeof book.imageUrl === "string" ? book.imageUrl : book.imageUrl?.url,
    }),
  },
  game: {
    endpoint: apiEndpoints.getGameDetails,
    envelope: "game",
    kindLabel: "Game",
    toCard: (game) => ({
      title: game.name,
      year: yearOf(game.firstReleaseDate),
      facts: facts(...names(game.genres, 2), ...names(game.platforms, 1)),
      description: game.summary,
      score: game.tgReviewScore,
      posterUrl: game.coverUrl,
    }),
  },
};

export async function loadMediaCard(type: OgMediaType, slug: string): Promise<MediaCardProps> {
  const source = SOURCES[type];
  const { data } = await api.get<Record<string, RawMedia>>(source.endpoint(slug));

  return { kindLabel: source.kindLabel, ...source.toCard(data[source.envelope] ?? {}) };
}

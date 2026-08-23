import type { ApiTypes } from "@/lib/api";

export type WatchLinkMediaType = "movie" | "tv" | "anime";

export const WATCH_LINK_MEDIA_TYPES: WatchLinkMediaType[] = ["movie", "tv", "anime"];

export const WATCH_LINK_CONTENT_TYPE: Record<WatchLinkMediaType, ApiTypes.WatchLinkContentType> = {
  movie: "Movie",
  tv: "TVShow",
  anime: "Anime",
};

export const WATCH_LINK_MEDIA_TYPE: Record<ApiTypes.WatchLinkContentType, WatchLinkMediaType> = {
  Movie: "movie",
  TVShow: "tv",
  Anime: "anime",
};

export const WATCH_LINK_VARIABLES = [
  "ID_IMDB",
  "ID_TMDB",
  "ID_MAL",
  "TITLE",
  "TITLE+",
  "TITLE-",
  "TITLE_ROMANJI",
  "TITLE_ROMANJI+",
  "TITLE_ROMANJI-",
  "SEASON",
  "EPISODE",
] as const;

export type WatchLinkVariable = (typeof WATCH_LINK_VARIABLES)[number];

export const WATCH_LINK_VARIABLE_SUPPORT: Record<WatchLinkVariable, WatchLinkMediaType[]> = {
  ID_IMDB: ["movie", "tv"],
  ID_TMDB: ["movie", "tv"],
  ID_MAL: ["anime"],
  TITLE: WATCH_LINK_MEDIA_TYPES,
  "TITLE+": WATCH_LINK_MEDIA_TYPES,
  "TITLE-": WATCH_LINK_MEDIA_TYPES,
  TITLE_ROMANJI: WATCH_LINK_MEDIA_TYPES,
  "TITLE_ROMANJI+": WATCH_LINK_MEDIA_TYPES,
  "TITLE_ROMANJI-": WATCH_LINK_MEDIA_TYPES,
  SEASON: ["tv", "anime"],
  EPISODE: ["tv", "anime"],
};

export const MAX_WATCH_LINKS = 20;

export const MAX_WATCH_LINK_URL_LENGTH = 500;

const BLOCKED_SCHEMES = ["javascript", "data", "vbscript", "file", "blob", "about"];

const SCHEME_REGEX = /^([a-z][a-z0-9+.-]*):\/?\/?(.+)$/i;

const VARIABLE_REGEX = /%([^%\s]+)%/g;

const knownVariables = new Set<string>(WATCH_LINK_VARIABLES);

export interface WatchLinkContext {
  mediaType: WatchLinkMediaType;
  imdbId?: string | null;
  tmdbId?: number | string | null;
  malId?: number | string | null;
  title?: string | null;
  titleRomaji?: string | null;
  season?: number | null;
  episode?: number | null;
}

export interface WatchLinkSeason {
  seasonNumber: number;
  totalEpisodes: number;
  watchedEpisodes: number[];
}

export function isSafeWatchLinkUrl(url: string): boolean {
  const trimmed = url.trim();

  if (!trimmed || trimmed.length > MAX_WATCH_LINK_URL_LENGTH) return false;

  if (/[\s<>"']/.test(trimmed)) return false;

  const match = SCHEME_REGEX.exec(trimmed);

  return !!match && !BLOCKED_SCHEMES.includes(match[1].toLowerCase());
}

export function isKnownWatchLinkVariable(name: string): name is WatchLinkVariable {
  return knownVariables.has(name.toUpperCase());
}

export function watchLinkVariables(template: string): string[] {
  return [...template.matchAll(VARIABLE_REGEX)].map(([, name]) => name.toUpperCase());
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function plainTitle(value: string) {
  const normalized = normalize(value);

  const cleaned = normalized
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return encodeURIComponent(cleaned || normalized);
}

function joinedTitle(value: string, separator: "+" | "-") {
  const normalized = normalize(value);

  const parts = normalized.split(/[^\p{Letter}\p{Number}]+/u).filter(Boolean);

  if (parts.length === 0) return encodeURIComponent(normalized);

  return parts.map((part) => encodeURIComponent(part)).join(separator);
}

function resolveVariable(name: string, context: WatchLinkContext): string | null {
  const title = context.title?.trim() || null;
  const romaji = context.titleRomaji?.trim() || title;

  switch (name) {
    case "ID_IMDB":
      return context.imdbId ? String(context.imdbId) : null;
    case "ID_TMDB":
      return context.tmdbId ? String(context.tmdbId) : null;
    case "ID_MAL":
      return context.malId ? String(context.malId) : null;
    case "TITLE":
      return title ? plainTitle(title) : null;
    case "TITLE+":
      return title ? joinedTitle(title, "+") : null;
    case "TITLE-":
      return title ? joinedTitle(title, "-") : null;
    case "TITLE_ROMANJI":
      return romaji ? plainTitle(romaji) : null;
    case "TITLE_ROMANJI+":
      return romaji ? joinedTitle(romaji, "+") : null;
    case "TITLE_ROMANJI-":
      return romaji ? joinedTitle(romaji, "-") : null;
    case "SEASON":
      return String(context.season && context.season > 0 ? context.season : 1);
    case "EPISODE":
      return String(context.episode && context.episode > 0 ? context.episode : 1);
    default:
      return null;
  }
}

export const WATCH_LINK_SAMPLE_CONTEXT: WatchLinkContext = {
  mediaType: "tv",
  imdbId: "tt0944947",
  tmdbId: 1399,
  malId: 21,
  title: "Spider-Man: A Brand New Day",
  titleRomaji: "Kimetsu no Yaiba",
  season: 2,
  episode: 5,
};

export function watchLinkVariableExample(variable: WatchLinkVariable): string {
  return resolveVariable(variable, WATCH_LINK_SAMPLE_CONTEXT) ?? "";
}

export function previewWatchLinkUrl(template: string): string {
  return template
    .trim()
    .replace(
      VARIABLE_REGEX,
      (match, name: string) => resolveVariable(name.toUpperCase(), WATCH_LINK_SAMPLE_CONTEXT) ?? match,
    );
}

export function buildWatchLinkUrl(template: string, context: WatchLinkContext): string | null {
  let missing = false;

  const url = template.trim().replace(VARIABLE_REGEX, (match, name: string) => {
    const value = resolveVariable(name.toUpperCase(), context);

    if (value === null) {
      missing = true;

      return match;
    }

    return value;
  });

  if (missing || !isSafeWatchLinkUrl(url)) return null;

  return url;
}

export function nextEpisodeFromSeasons(seasons: WatchLinkSeason[]): { season: number; episode: number } {
  const ordered = [...seasons]
    .filter((season) => season.seasonNumber > 0)
    .sort((a, b) => a.seasonNumber - b.seasonNumber);

  for (const season of ordered) {
    const watched = new Set(season.watchedEpisodes);

    for (let episode = 1; episode <= season.totalEpisodes; episode++) {
      if (!watched.has(episode)) return { season: season.seasonNumber, episode };
    }
  }

  const last = ordered.at(-1);

  if (!last) return { season: 1, episode: 1 };

  return { season: last.seasonNumber, episode: Math.max(last.totalEpisodes, 1) };
}

export function nextEpisode(totalEpisodes: number, watchedEpisodes: number[]): number {
  const { episode } = nextEpisodeFromSeasons([{ seasonNumber: 1, totalEpisodes, watchedEpisodes }]);

  return episode;
}

export function resolveWatchLinks(links: ApiTypes.WatchLink[] | undefined, context: WatchLinkContext) {
  const contentType = WATCH_LINK_CONTENT_TYPE[context.mediaType];

  return (links ?? [])
    .filter((link) => link.enabled && link.contentTypes.includes(contentType))
    .map((link) => ({ link, url: buildWatchLinkUrl(link.url, context) }))
    .filter((entry): entry is { link: ApiTypes.WatchLink; url: string } => entry.url !== null);
}

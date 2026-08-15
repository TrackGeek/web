import { type ApiTypes, apiEndpoints } from "@/lib/api";
import type { ContentTypeSlug } from "@/lib/content-types";

export const BACKUP_VERSION = 1;

export const MANIFEST_PATH = "manifest.json";

export const SCREENSHOTS_PATH = "screenshots/game.csv";

export function progressPath(contentType: ContentTypeSlug) {
  return `progress/${contentType}.csv`;
}

export function reviewsPath(contentType: ContentTypeSlug) {
  return `reviews/${contentType}.csv`;
}

export const EPISODE_CONTENT_TYPES = ["anime", "tv"] as const;

export type EpisodeContentType = (typeof EPISODE_CONTENT_TYPES)[number];

export function episodesPath(contentType: EpisodeContentType) {
  return `episodes/${contentType}.csv`;
}

export type MediaKey = "anime" | "manga" | "tvShow" | "movie" | "game" | "book";

export interface BackupMediaConfig {
  mediaKey: MediaKey;
  externalIdField: "malId" | "anilistId" | "tmdbId" | "igdbId" | "hardcoverId";
  progressEndpoint: string;
  progressResponseKey: keyof Omit<ApiTypes.GetProgressResponse, "statusCounts">;
  reviewEndpoint: string;
  reviewResponseKey: keyof ApiTypes.GetReviewsResponse;
  detailEndpoint: (externalId: string) => string;
  episodeWatch?: { endpoint: string; responseKey: string };
}

export const BACKUP_MEDIA: Record<ContentTypeSlug, BackupMediaConfig> = {
  anime: {
    mediaKey: "anime",
    externalIdField: "malId",
    progressEndpoint: apiEndpoints.animeProgress,
    progressResponseKey: "animeProgresses",
    reviewEndpoint: apiEndpoints.animeReview,
    reviewResponseKey: "animeReviews",
    detailEndpoint: apiEndpoints.getAnimeDetails,
    episodeWatch: { endpoint: apiEndpoints.animeEpisodeWatch, responseKey: "animeEpisodeWatch" },
  },
  manga: {
    mediaKey: "manga",
    externalIdField: "anilistId",
    progressEndpoint: apiEndpoints.mangaProgress,
    progressResponseKey: "mangaProgresses",
    reviewEndpoint: apiEndpoints.mangaReview,
    reviewResponseKey: "mangaReviews",
    detailEndpoint: apiEndpoints.getMangaDetails,
  },
  tv: {
    mediaKey: "tvShow",
    externalIdField: "tmdbId",
    progressEndpoint: apiEndpoints.tvShowProgress,
    progressResponseKey: "tvShowProgresses",
    reviewEndpoint: apiEndpoints.tvShowReview,
    reviewResponseKey: "tvShowReviews",
    detailEndpoint: apiEndpoints.getTvShowDetails,
    episodeWatch: { endpoint: apiEndpoints.tvShowEpisodeWatch, responseKey: "tvShowEpisodeWatch" },
  },
  movie: {
    mediaKey: "movie",
    externalIdField: "tmdbId",
    progressEndpoint: apiEndpoints.movieProgress,
    progressResponseKey: "movieProgresses",
    reviewEndpoint: apiEndpoints.movieReview,
    reviewResponseKey: "movieReviews",
    detailEndpoint: apiEndpoints.getMovieDetails,
  },
  game: {
    mediaKey: "game",
    externalIdField: "igdbId",
    progressEndpoint: apiEndpoints.gameProgress,
    progressResponseKey: "gameProgresses",
    reviewEndpoint: apiEndpoints.gameReview,
    reviewResponseKey: "gameReviews",
    detailEndpoint: apiEndpoints.getGameDetails,
  },
  book: {
    mediaKey: "book",
    externalIdField: "hardcoverId",
    progressEndpoint: apiEndpoints.bookProgress,
    progressResponseKey: "bookProgresses",
    reviewEndpoint: apiEndpoints.bookReview,
    reviewResponseKey: "bookReviews",
    detailEndpoint: apiEndpoints.getBookDetails,
  },
};

export function mediaIdKey(contentType: ContentTypeSlug) {
  return `${BACKUP_MEDIA[contentType].mediaKey}Id`;
}

export type BackupFieldKind = "string" | "number" | "integer" | "boolean" | "date" | "list";

export interface BackupField {
  name: string;
  kind: BackupFieldKind;
  reference?: boolean;
}

export const EXTERNAL_ID_COLUMN = "externalId";

const TITLE_FIELD: BackupField = { name: "title", kind: "string", reference: true };

const PROGRESS_COMMON: BackupField[] = [
  TITLE_FIELD,
  { name: "status", kind: "string" },
  { name: "startedAt", kind: "date" },
  { name: "completedAt", kind: "date" },
];

const REVIEW_COMMON: BackupField[] = [
  TITLE_FIELD,
  { name: "overall", kind: "number" },
  { name: "summary", kind: "string" },
  { name: "notes", kind: "string" },
  { name: "recommended", kind: "boolean" },
];

export const PROGRESS_FIELDS: Record<ContentTypeSlug, BackupField[]> = {
  anime: [...PROGRESS_COMMON, { name: "watchCount", kind: "integer" }],
  manga: [
    ...PROGRESS_COMMON,
    { name: "malId", kind: "integer", reference: true },
    { name: "chaptersRead", kind: "integer" },
    { name: "readCount", kind: "integer" },
  ],
  tv: [...PROGRESS_COMMON, { name: "watchCount", kind: "integer" }, { name: "notes", kind: "string" }],
  movie: [...PROGRESS_COMMON, { name: "watchCount", kind: "integer" }],
  game: [
    ...PROGRESS_COMMON,
    { name: "playCount", kind: "integer" },
    { name: "completion", kind: "string" },
    { name: "hoursPlayed", kind: "integer" },
    { name: "platforms", kind: "list" },
    { name: "notes", kind: "string" },
  ],
  book: [...PROGRESS_COMMON, { name: "chaptersRead", kind: "integer" }, { name: "readCount", kind: "integer" }],
};

export const REVIEW_FIELDS: Record<ContentTypeSlug, BackupField[]> = {
  anime: [
    ...REVIEW_COMMON,
    { name: "story", kind: "number" },
    { name: "characters", kind: "number" },
    { name: "animation", kind: "number" },
    { name: "sound", kind: "number" },
    { name: "enjoyment", kind: "number" },
    { name: "pros", kind: "string" },
    { name: "cons", kind: "string" },
  ],
  manga: [
    ...REVIEW_COMMON,
    { name: "malId", kind: "integer", reference: true },
    { name: "art", kind: "number" },
    { name: "worldbuilding", kind: "number" },
    { name: "story", kind: "string" },
    { name: "characters", kind: "string" },
  ],
  tv: [
    ...REVIEW_COMMON,
    { name: "direction", kind: "number" },
    { name: "production", kind: "number" },
    { name: "acting", kind: "number" },
    { name: "story", kind: "string" },
  ],
  movie: [
    ...REVIEW_COMMON,
    { name: "direction", kind: "number" },
    { name: "production", kind: "number" },
    { name: "acting", kind: "number" },
    { name: "story", kind: "string" },
  ],
  game: [
    ...REVIEW_COMMON,
    { name: "graphics", kind: "number" },
    { name: "sound", kind: "number" },
    { name: "story", kind: "number" },
    { name: "gameplay", kind: "number" },
    { name: "platform", kind: "string" },
  ],
  book: [
    ...REVIEW_COMMON,
    { name: "characters", kind: "number" },
    { name: "language", kind: "number" },
    { name: "theme", kind: "number" },
  ],
};

export const EPISODE_FIELDS: Record<EpisodeContentType, BackupField[]> = {
  anime: [TITLE_FIELD, { name: "episode", kind: "integer" }, { name: "status", kind: "string" }],
  tv: [
    TITLE_FIELD,
    { name: "season", kind: "integer" },
    { name: "episode", kind: "integer" },
    { name: "status", kind: "string" },
  ],
};

export const SCREENSHOT_FIELDS: BackupField[] = [
  TITLE_FIELD,
  { name: "url", kind: "string" },
  { name: "type", kind: "string" },
  { name: "description", kind: "string" },
  { name: "isSpoiler", kind: "boolean" },
];

export function columnsFor(fields: BackupField[]) {
  return [EXTERNAL_ID_COLUMN, ...fields.map(({ name }) => name)];
}

const LIST_SEPARATOR = "|";

export function serializeField(field: BackupField, value: unknown): string {
  if (value === null || value === undefined) return "";

  if (field.kind === "list") {
    return Array.isArray(value) ? value.map(String).join(LIST_SEPARATOR) : String(value);
  }

  if (field.kind === "boolean") return value ? "true" : "false";

  if (field.kind === "date") {
    const date = new Date(String(value));

    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  return String(value);
}

export function parseField(field: BackupField, raw: string): unknown {
  const value = raw.trim();

  if (value === "") return undefined;

  switch (field.kind) {
    case "list":
      return value
        .split(LIST_SEPARATOR)
        .map((item) => item.trim())
        .filter(Boolean);
    case "boolean":
      if (["true", "1", "yes"].includes(value.toLowerCase())) return true;
      if (["false", "0", "no"].includes(value.toLowerCase())) return false;
      return undefined;
    case "date": {
      const date = new Date(value);

      return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    case "integer": {
      const parsed = Number.parseInt(value, 10);

      return Number.isNaN(parsed) ? undefined : parsed;
    }
    case "number": {
      const parsed = Number(value);

      return Number.isNaN(parsed) ? undefined : parsed;
    }
    default:
      return value;
  }
}

export function payloadFrom(fields: BackupField[], row: Record<string, string>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    if (field.reference) continue;

    const value = parseField(field, row[field.name] ?? "");

    if (value !== undefined) payload[field.name] = value;
  }

  return payload;
}

export function rowFrom(fields: BackupField[], externalId: string, source: Record<string, unknown>) {
  const row: Record<string, string> = { [EXTERNAL_ID_COLUMN]: externalId };

  for (const field of fields) {
    row[field.name] = serializeField(field, source[field.name]);
  }

  return row;
}

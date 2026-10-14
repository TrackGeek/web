import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import {
  detailLimiter,
  type ImportRunner,
  MEDIA_NOT_FOUND,
  type OnRetry,
  upsertReview,
  withRetry,
} from "@/lib/import/shared";
import type { MalEntry } from "@/types/myanimelist-import";

const SCORE_DIVISOR = 2;

const EMPTY_DATE = "0000-00-00";

const STATUS_MAP: Record<string, ApiTypes.ProgressStatus> = {
  Watching: "Watching",
  Reading: "Reading",
  Completed: "Completed",
  "On-Hold": "Paused",
  Dropped: "Dropped",
  "Plan to Watch": "Planning",
  "Plan to Read": "Planning",
};

function text(node: Element, tag: string): string {
  return node.querySelector(tag)?.textContent?.trim() ?? "";
}

function number(node: Element, tag: string): number {
  const parsed = Number.parseInt(text(node, tag), 10);

  return Number.isNaN(parsed) ? 0 : parsed;
}

function toIsoDate(value: string): string | undefined {
  if (!value || value === EMPTY_DATE) return undefined;

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function mapEntry(node: Element): MalEntry | null {
  const isManga = node.tagName === "manga";
  const malId = text(node, isManga ? "manga_mangadb_id" : "series_animedb_id");
  const status = STATUS_MAP[text(node, "my_status")];

  if (!malId || !status) return null;

  const score = number(node, "my_score");
  const entry = {
    id: `${isManga ? "manga" : "anime"}:${malId}`,
    malId,
    name: text(node, isManga ? "manga_title" : "series_title") || malId,
    status,
    startedAt: toIsoDate(text(node, "my_start_date")),
    completedAt: toIsoDate(text(node, "my_finish_date")),
    rating: score > 0 ? score / SCORE_DIVISOR : undefined,
  };

  if (isManga) {
    return {
      ...entry,
      mediaType: "manga",
      chaptersRead: number(node, "my_read_chapters"),
      readCount: number(node, "my_times_read"),
    };
  }

  const totalEpisodes = number(node, "series_episodes");
  const watched = number(node, "my_watched_episodes");
  const timesWatched = number(node, "my_times_watched");

  return {
    ...entry,
    mediaType: "anime",
    watchedEpisodes: totalEpisodes > 0 ? Math.min(watched, totalEpisodes) : watched,
    watchCount: timesWatched > 0 ? timesWatched : undefined,
  };
}

const GZIP_EXTENSION = ".gz";

export async function readExportFile(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith(GZIP_EXTENSION)) return file.text();

  const stream = file.stream().pipeThrough(new DecompressionStream("gzip"));

  return new Response(stream).text();
}

export function parseExport(raw: string): { entries: MalEntry[]; ignored: number } {
  const document = new DOMParser().parseFromString(raw, "application/xml");

  if (document.querySelector("parsererror")) throw new Error("INVALID_XML");

  const nodes = Array.from(document.querySelectorAll("myanimelist > anime, myanimelist > manga"));
  const entries = nodes.map(mapEntry).filter((entry) => entry !== null);

  return { entries, ignored: nodes.length - entries.length };
}

const ANIME_REVIEW_TARGET = {
  endpoint: apiEndpoints.animeReview,
  idKey: "animeId",
  responseKey: "animeReviews",
} as const;

const MANGA_REVIEW_TARGET = {
  endpoint: apiEndpoints.mangaReview,
  idKey: "mangaId",
  responseKey: "mangaReviews",
} as const;

async function importEntry(
  entry: MalEntry,
  userId: string,
  signal: AbortSignal,
  onRetry: OnRetry,
  onResume: () => void,
) {
  const mediaId = await withRetry(
    async () => {
      await detailLimiter.acquire(signal);

      onResume();

      const endpoint =
        entry.mediaType === "manga"
          ? apiEndpoints.getMangaDetailsByMalId(entry.malId)
          : apiEndpoints.getAnimeDetails(entry.malId);
      const { data } = await api.get(endpoint, { signal });

      const id = data?.[entry.mediaType]?.id;

      if (!id) throw new Error(MEDIA_NOT_FOUND);

      return id as string;
    },
    signal,
    onRetry,
  );

  if (entry.mediaType === "manga") {
    await withRetry(
      () =>
        api.post(
          apiEndpoints.mangaProgress,
          {
            mangaId: mediaId,
            status: entry.status,
            chaptersRead: entry.chaptersRead,
            readCount: entry.readCount,
            startedAt: entry.startedAt,
            completedAt: entry.completedAt,
          },
          { signal },
        ),
      signal,
      onRetry,
    );

    if (entry.rating) {
      await upsertReview(MANGA_REVIEW_TARGET, mediaId, userId, { overall: entry.rating }, signal, onRetry);
    }

    return;
  }

  if (entry.watchedEpisodes > 0) {
    await withRetry(
      () =>
        api.post(
          apiEndpoints.animeEpisodeWatch,
          {
            animeId: mediaId,
            episodes: Array.from({ length: entry.watchedEpisodes }, (_, index) => ({
              episode: index + 1,
              status: "Completed",
            })),
          },
          { signal },
        ),
      signal,
      onRetry,
    );
  }

  await withRetry(
    () =>
      api.post(
        apiEndpoints.animeProgress,
        {
          animeId: mediaId,
          status: entry.status,
          watchCount: entry.watchCount,
          startedAt: entry.startedAt,
          completedAt: entry.completedAt,
        },
        { signal },
      ),
    signal,
    onRetry,
  );

  if (entry.rating) {
    await upsertReview(ANIME_REVIEW_TARGET, mediaId, userId, { overall: entry.rating }, signal, onRetry);
  }
}

export function myanimelistRunner(userId: string): ImportRunner<MalEntry> {
  return {
    importEntry: (entry, signal, onRetry, onResume) => importEntry(entry, userId, signal, onRetry, onResume),
    notFoundKey: "settings:import.errors.notFound",
  };
}

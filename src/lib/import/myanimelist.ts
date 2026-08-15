import { type ApiTypes, api, apiEndpoints } from "@/lib/api";
import {
  detailLimiter,
  type ImportEntry,
  type ImportRunner,
  MEDIA_NOT_FOUND,
  type OnRetry,
  upsertReview,
  withRetry,
} from "@/lib/import/shared";

const SCORE_DIVISOR = 2;

const EMPTY_DATE = "0000-00-00";

const STATUS_MAP: Record<string, ApiTypes.ProgressStatus> = {
  Watching: "Watching",
  Completed: "Completed",
  "On-Hold": "Paused",
  Dropped: "Dropped",
  "Plan to Watch": "Planning",
};

export interface MalEntry extends ImportEntry {
  watchedEpisodes: number;
  watchCount?: number;
  startedAt?: string;
  completedAt?: string;
  rating?: number;
}

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
  const malId = text(node, "series_animedb_id");
  const status = STATUS_MAP[text(node, "my_status")];

  if (!malId || !status) return null;

  const totalEpisodes = number(node, "series_episodes");
  const watched = number(node, "my_watched_episodes");
  const timesWatched = number(node, "my_times_watched");
  const score = number(node, "my_score");

  return {
    id: malId,
    name: text(node, "series_title") || malId,
    status,
    watchedEpisodes: totalEpisodes > 0 ? Math.min(watched, totalEpisodes) : watched,
    watchCount: timesWatched > 0 ? timesWatched : undefined,
    startedAt: toIsoDate(text(node, "my_start_date")),
    completedAt: toIsoDate(text(node, "my_finish_date")),
    rating: score > 0 ? score / SCORE_DIVISOR : undefined,
  };
}

const GZIP_EXTENSION = ".gz";

/** MyAnimeList hands out the list gzipped, so accept both the archive and an already extracted XML. */
export async function readExportFile(file: File): Promise<string> {
  if (!file.name.toLowerCase().endsWith(GZIP_EXTENSION)) return file.text();

  const stream = file.stream().pipeThrough(new DecompressionStream("gzip"));

  return new Response(stream).text();
}

export function parseExport(raw: string): { entries: MalEntry[]; ignored: number } {
  const document = new DOMParser().parseFromString(raw, "application/xml");

  if (document.querySelector("parsererror")) throw new Error("INVALID_XML");

  const nodes = Array.from(document.querySelectorAll("myanimelist > anime"));
  const entries = nodes.map(mapEntry).filter((entry) => entry !== null);

  return { entries, ignored: nodes.length - entries.length };
}

const REVIEW_TARGET = {
  endpoint: apiEndpoints.animeReview,
  idKey: "animeId",
  responseKey: "animeReviews",
} as const;

async function importEntry(
  entry: MalEntry,
  userId: string,
  signal: AbortSignal,
  onRetry: OnRetry,
  onResume: () => void,
) {
  const animeId = await withRetry(
    async () => {
      await detailLimiter.acquire(signal);

      onResume();

      const { data } = await api.get(apiEndpoints.getAnimeDetails(entry.id), { signal });

      const id = data?.anime?.id;

      if (!id) throw new Error(MEDIA_NOT_FOUND);

      return id as string;
    },
    signal,
    onRetry,
  );

  if (entry.watchedEpisodes > 0) {
    await withRetry(
      () =>
        api.post(
          apiEndpoints.animeEpisodeWatch,
          {
            animeId,
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
          animeId,
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
    await upsertReview(REVIEW_TARGET, animeId, userId, { overall: entry.rating }, signal, onRetry);
  }
}

export function myanimelistRunner(userId: string): ImportRunner<MalEntry> {
  return {
    importEntry: (entry, signal, onRetry, onResume) => importEntry(entry, userId, signal, onRetry, onResume),
    notFoundKey: "settings:import.errors.animeNotFound",
  };
}

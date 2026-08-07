import axios from "axios";
import z from "zod";
import { api, apiEndpoints } from "@/lib/api";

const RATING_DIVISOR = 2;

const MIN_TRACKED_HOURS = 1;

const CLOSED_STATUSES = ["dropped", "shelved", "abandoned", "completed"];

const playDateSchema = z.object({
  range_start_date: z.string().nullish(),
  range_end_date: z.string().nullish(),
  start_date: z.string().nullish(),
  finish_date: z.string().nullish(),
});

const playthroughSchema = z.object({
  id: z.number(),
  rating: z.number().nullish(),
  start_date: z.string().nullish(),
  finish_date: z.string().nullish(),
  play_dates: z.array(playDateSchema).nullish(),
});

const gameLogSchema = z.object({
  status: z.string().nullish(),
  rating: z.number().nullish(),
  is_play: z.boolean().nullish(),
  is_playing: z.boolean().nullish(),
  is_backlog: z.boolean().nullish(),
  is_wishlist: z.boolean().nullish(),
  total_hours: z.number().nullish(),
});

const backloggdEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  game_log: gameLogSchema,
  playthroughs: z.record(z.string(), playthroughSchema).nullish(),
  most_recent_playthrough_id: z.number().nullish(),
});

export const backloggdExportSchema = z.array(backloggdEntrySchema);

export type BackloggdEntry = z.infer<typeof backloggdEntrySchema>;

type Playthrough = z.infer<typeof playthroughSchema>;

export type ProgressStatus = "Planning" | "Playing" | "Completed" | "Paused" | "Dropped";

export interface MappedEntry {
  igdbId: string;
  name: string;
  status: ProgressStatus;
  hoursPlayed?: number;
  startedAt?: string;
  completedAt?: string;
  rating?: number;
}

function mapStatus(log: BackloggdEntry["game_log"]): ProgressStatus | null {
  const status = log.status ?? "";

  if (status === "completed") return "Completed";

  if (log.is_playing) return "Playing";

  if ((log.is_wishlist || log.is_backlog) && !CLOSED_STATUSES.includes(status)) return "Planning";

  if (log.is_play) return "Dropped";

  return null;
}

function pickPlaythrough(entry: BackloggdEntry): Playthrough | null {
  const playthroughs = Object.values(entry.playthroughs ?? {});

  if (playthroughs.length === 0) return null;

  return playthroughs.find(({ id }) => id === entry.most_recent_playthrough_id) ?? playthroughs[0];
}

function toIsoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function mapEntry(entry: BackloggdEntry): MappedEntry | null {
  const status = mapStatus(entry.game_log);

  if (!status) return null;

  const playthrough = pickPlaythrough(entry);
  const playDate = playthrough?.play_dates?.[0];

  const hours = entry.game_log.total_hours ?? 0;
  const rating = entry.game_log.rating || playthrough?.rating || 0;

  return {
    igdbId: entry.id,
    name: entry.name,
    status,
    hoursPlayed: hours >= MIN_TRACKED_HOURS ? hours : undefined,
    startedAt: toIsoDate(playthrough?.start_date ?? playDate?.start_date ?? playDate?.range_start_date),
    completedAt: toIsoDate(playthrough?.finish_date ?? playDate?.finish_date ?? playDate?.range_end_date),
    rating: rating > 0 ? rating / RATING_DIVISOR : undefined,
  };
}

export type ImportItemState = "pending" | "running" | "waiting" | "done" | "error";

export interface ImportItem {
  igdbId: string;
  name: string;
  status: ProgressStatus;
  state: ImportItemState;
  attempt?: number;
  errorKey?: string;
}

export interface ImportProgress {
  items: ImportItem[];
  done: number;
  failed: number;
  total: number;
}

export function parseExport(raw: unknown): { entries: MappedEntry[]; ignored: number } {
  const parsed = backloggdExportSchema.parse(raw);
  const entries = parsed.map(mapEntry).filter((entry) => entry !== null);

  return { entries, ignored: parsed.length - entries.length };
}

const GAME_NOT_FOUND = "GAME_NOT_FOUND";

export const DETAIL_REQUESTS_PER_SECOND = 4;

const RATE_WINDOW_MS = 1000;

const BASE_BACKOFF_MS = 1000;

const MAX_BACKOFF_MS = 30_000;

/**
 * Safety net: with the capped backoff this spans a few minutes of retrying, long enough for
 * any real outage, while stopping an unforeseen deterministic error from hanging the import.
 */
const MAX_ATTEMPTS = 10;

class RateLimiter {
  private starts: number[] = [];

  private readonly limit: number;

  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  async acquire(signal: AbortSignal) {
    while (true) {
      const now = Date.now();

      this.starts = this.starts.filter((start) => now - start < this.windowMs);

      if (this.starts.length < this.limit) {
        this.starts.push(now);
        return;
      }

      await delay(this.windowMs - (now - this.starts[0]), signal);
    }
  }
}

const detailLimiter = new RateLimiter(DETAIL_REQUESTS_PER_SECOND, RATE_WINDOW_MS);

function delay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };

    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    signal.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Statuses for a request that can never succeed as sent: a game the API doesn't know (404)
 * and a row that already exists (409, Prisma P2002). Retrying either one just stalls the import.
 */
const TERMINAL_STATUSES = [404, 409];

function isRetryable(error: unknown): boolean {
  if (error instanceof Error && error.message === GAME_NOT_FOUND) return false;

  if (!axios.isAxiosError(error)) return false;

  const status = error.response?.status;

  return status === undefined || !TERMINAL_STATUSES.includes(status);
}

function retryAfterMs(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null;

  const header = error.response?.headers?.["retry-after"];

  if (!header) return null;

  const seconds = Number(header);

  if (Number.isFinite(seconds)) return seconds * RATE_WINDOW_MS;

  const date = new Date(String(header)).getTime();

  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

function backoffMs(attempt: number) {
  const capped = Math.min(BASE_BACKOFF_MS * 2 ** (attempt - 1), MAX_BACKOFF_MS);

  return capped * (0.75 + Math.random() * 0.5);
}

async function withRetry<T>(
  operation: () => Promise<T>,
  signal: AbortSignal,
  onRetry: (attempt: number) => void,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (signal.aborted || !isRetryable(error) || attempt >= MAX_ATTEMPTS) throw error;

      onRetry(attempt);

      await delay(retryAfterMs(error) ?? backoffMs(attempt), signal);
    }
  }
}

/**
 * `POST /game/review` only ever creates, and the table is unique on (userId, gameId), so a
 * game the user already reviewed answers 409. Mirrors the modal: look the review up first
 * and PATCH it when it exists.
 */
async function upsertReview(
  gameId: string,
  userId: string,
  overall: number,
  signal: AbortSignal,
  onRetry: (attempt: number) => void,
) {
  const existing = await withRetry(
    () =>
      api
        .get(`${apiEndpoints.gameReview}/`, { params: { gameId, userId }, signal })
        .then(({ data }) => data?.gameReviews?.items?.[0] ?? null),
    signal,
    onRetry,
  );

  await withRetry(
    () =>
      existing
        ? api.patch(`${apiEndpoints.gameReview}/${existing.id}`, { gameId, overall }, { signal })
        : api.post(apiEndpoints.gameReview, { gameId, overall }, { signal }),
    signal,
    onRetry,
  );
}

async function importEntry(
  entry: MappedEntry,
  userId: string,
  signal: AbortSignal,
  onRetry: (attempt: number) => void,
  onResume: () => void,
) {
  const gameId = await withRetry(
    async () => {
      await detailLimiter.acquire(signal);

      onResume();

      const { data } = await api.get(apiEndpoints.getGameDetails(entry.igdbId), { signal });

      const id = data?.game?.id;

      if (!id) throw new Error(GAME_NOT_FOUND);

      return id as string;
    },
    signal,
    onRetry,
  );

  await withRetry(
    () =>
      api.post(
        apiEndpoints.gameProgress,
        {
          gameId,
          status: entry.status,
          hoursPlayed: entry.hoursPlayed,
          startedAt: entry.startedAt,
          completedAt: entry.completedAt,
        },
        { signal },
      ),
    signal,
    onRetry,
  );

  if (entry.rating) {
    await upsertReview(gameId, userId, entry.rating, signal, onRetry);
  }
}

function errorKeyFor(error: unknown): string {
  if (error instanceof Error && error.message === GAME_NOT_FOUND) return "settings:import.errors.notFound";

  if (axios.isAxiosError(error) && error.response?.status === 404) return "settings:import.errors.notFound";

  return "settings:import.errors.failed";
}

const CONCURRENCY = DETAIL_REQUESTS_PER_SECOND;

export async function runImport(
  entries: MappedEntry[],
  userId: string,
  signal: AbortSignal,
  onProgress: (progress: ImportProgress) => void,
): Promise<ImportProgress> {
  const items: ImportItem[] = entries.map((entry) => ({
    igdbId: entry.igdbId,
    name: entry.name,
    status: entry.status,
    state: "pending",
  }));

  const progress: ImportProgress = { items, done: 0, failed: 0, total: entries.length };

  const emit = () => onProgress({ ...progress, items: [...progress.items] });

  emit();

  let cursor = 0;

  const worker = async () => {
    while (cursor < entries.length) {
      if (signal.aborted) return;

      const index = cursor++;

      items[index] = { ...items[index], state: "running" };
      emit();

      try {
        await importEntry(
          entries[index],
          userId,
          signal,
          (attempt) => {
            items[index] = { ...items[index], state: "waiting", attempt };
            emit();
          },
          () => {
            if (items[index].state === "running") return;

            items[index] = { ...items[index], state: "running" };
            emit();
          },
        );

        items[index] = { ...items[index], state: "done", attempt: undefined };
        progress.done++;
      } catch (error) {
        if (signal.aborted) return;

        items[index] = { ...items[index], state: "error", attempt: undefined, errorKey: errorKeyFor(error) };
        progress.failed++;
      }

      emit();
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker));

  return progress;
}

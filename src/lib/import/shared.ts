import axios from "axios";
import { type ApiTypes, api } from "@/lib/api";

export const MEDIA_NOT_FOUND = "MEDIA_NOT_FOUND";

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

export const detailLimiter = new RateLimiter(DETAIL_REQUESTS_PER_SECOND, RATE_WINDOW_MS);

export function delay(ms: number, signal: AbortSignal) {
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
 * Statuses for a request that can never succeed as sent: a media the API doesn't know (404)
 * and a row that already exists (409, Prisma P2002). Retrying either one just stalls the import.
 */
const TERMINAL_STATUSES = [404, 409];

function isRetryable(error: unknown): boolean {
  if (error instanceof Error && error.message === MEDIA_NOT_FOUND) return false;

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

export type OnRetry = (attempt: number) => void;

export async function withRetry<T>(operation: () => Promise<T>, signal: AbortSignal, onRetry: OnRetry): Promise<T> {
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

export interface ReviewTarget {
  endpoint: string;
  idKey: "gameId" | "animeId";
  responseKey: "gameReviews" | "animeReviews";
}

/**
 * `POST /<media>/review` only ever creates, and the table is unique on (userId, mediaId), so a
 * media the user already reviewed answers 409. Mirrors the modal: look the review up first
 * and PATCH it when it exists.
 */
export async function upsertReview(
  target: ReviewTarget,
  mediaId: string,
  userId: string,
  overall: number,
  signal: AbortSignal,
  onRetry: OnRetry,
) {
  const existing = await withRetry(
    () =>
      api
        .get(`${target.endpoint}/`, { params: { [target.idKey]: mediaId, userId }, signal })
        .then(({ data }) => data?.[target.responseKey]?.items?.[0] ?? null),
    signal,
    onRetry,
  );

  const body = { [target.idKey]: mediaId, overall };

  await withRetry(
    () =>
      existing
        ? api.patch(`${target.endpoint}/${existing.id}`, body, { signal })
        : api.post(target.endpoint, body, { signal }),
    signal,
    onRetry,
  );
}

export function errorKeyFor(error: unknown, notFoundKey: string): string {
  if (error instanceof Error && error.message === MEDIA_NOT_FOUND) return notFoundKey;

  if (axios.isAxiosError(error) && error.response?.status === 404) return notFoundKey;

  return "settings:import.errors.failed";
}

export type ImportItemState = "pending" | "running" | "waiting" | "done" | "error";

export interface ImportEntry {
  id: string;
  name: string;
  status: ApiTypes.ProgressStatus;
}

export interface ImportItem extends ImportEntry {
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

const CONCURRENCY = DETAIL_REQUESTS_PER_SECOND;

export interface ImportRunner<TEntry extends ImportEntry> {
  importEntry: (entry: TEntry, signal: AbortSignal, onRetry: OnRetry, onResume: () => void) => Promise<void>;
  notFoundKey: string;
}

export async function runImport<TEntry extends ImportEntry>(
  entries: TEntry[],
  runner: ImportRunner<TEntry>,
  signal: AbortSignal,
  onProgress: (progress: ImportProgress) => void,
): Promise<ImportProgress> {
  const items: ImportItem[] = entries.map((entry) => ({
    id: entry.id,
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
        await runner.importEntry(
          entries[index],
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

        items[index] = {
          ...items[index],
          state: "error",
          attempt: undefined,
          errorKey: errorKeyFor(error, runner.notFoundKey),
        };
        progress.failed++;
      }

      emit();
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker));

  return progress;
}

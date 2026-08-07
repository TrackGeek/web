import z from "zod";
import { api, apiEndpoints } from "@/lib/api";
import {
  detailLimiter,
  type ImportEntry,
  type ImportRunner,
  MEDIA_NOT_FOUND,
  type OnRetry,
  upsertReview,
  withRetry,
} from "@/lib/import/shared";

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

export interface MappedEntry extends ImportEntry {
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
    id: entry.id,
    name: entry.name,
    status,
    hoursPlayed: hours >= MIN_TRACKED_HOURS ? hours : undefined,
    startedAt: toIsoDate(playthrough?.start_date ?? playDate?.start_date ?? playDate?.range_start_date),
    completedAt: toIsoDate(playthrough?.finish_date ?? playDate?.finish_date ?? playDate?.range_end_date),
    rating: rating > 0 ? rating / RATING_DIVISOR : undefined,
  };
}

export function parseExport(raw: unknown): { entries: MappedEntry[]; ignored: number } {
  const parsed = backloggdExportSchema.parse(raw);
  const entries = parsed.map(mapEntry).filter((entry) => entry !== null);

  return { entries, ignored: parsed.length - entries.length };
}

const REVIEW_TARGET = {
  endpoint: apiEndpoints.gameReview,
  idKey: "gameId",
  responseKey: "gameReviews",
} as const;

async function importEntry(
  entry: MappedEntry,
  userId: string,
  signal: AbortSignal,
  onRetry: OnRetry,
  onResume: () => void,
) {
  const gameId = await withRetry(
    async () => {
      await detailLimiter.acquire(signal);

      onResume();

      const { data } = await api.get(apiEndpoints.getGameDetails(entry.id), { signal });

      const id = data?.game?.id;

      if (!id) throw new Error(MEDIA_NOT_FOUND);

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
    await upsertReview(REVIEW_TARGET, gameId, userId, entry.rating, signal, onRetry);
  }
}

export function backloggdRunner(userId: string): ImportRunner<MappedEntry> {
  return {
    importEntry: (entry, signal, onRetry, onResume) => importEntry(entry, userId, signal, onRetry, onResume),
    notFoundKey: "settings:import.errors.notFound",
  };
}

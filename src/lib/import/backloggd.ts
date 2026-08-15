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

const IGDB_PLATFORM_NAMES: Record<number, string> = {
  3: "Linux",
  4: "Nintendo 64",
  5: "Wii",
  6: "PC (Microsoft Windows)",
  7: "PlayStation",
  8: "PlayStation 2",
  9: "PlayStation 3",
  11: "Xbox",
  12: "Xbox 360",
  13: "DOS",
  14: "Mac",
  15: "Commodore C64/128/MAX",
  16: "Amiga",
  18: "Nintendo Entertainment System",
  19: "Super Nintendo Entertainment System",
  20: "Nintendo DS",
  21: "Nintendo GameCube",
  22: "Game Boy Color",
  23: "Dreamcast",
  24: "Game Boy Advance",
  25: "Amstrad CPC",
  26: "ZX Spectrum",
  27: "MSX",
  29: "Sega Mega Drive/Genesis",
  30: "Sega 32X",
  32: "Sega Saturn",
  33: "Game Boy",
  34: "Android",
  35: "Sega Game Gear",
  37: "Nintendo 3DS",
  38: "PlayStation Portable",
  39: "iOS",
  41: "Wii U",
  46: "PlayStation Vita",
  48: "PlayStation 4",
  49: "Xbox One",
  50: "3DO Interactive Multiplayer",
  52: "Arcade",
  57: "WonderSwan",
  59: "Atari 2600",
  60: "Atari 7800",
  61: "Atari Lynx",
  62: "Atari Jaguar",
  63: "Atari ST/STE",
  64: "Sega Master System/Mark III",
  66: "Atari 5200",
  67: "Intellivision",
  68: "ColecoVision",
  70: "Vectrex",
  72: "Ouya",
  74: "Windows Phone",
  78: "Sega CD",
  79: "Neo Geo MVS",
  80: "Neo Geo AES",
  82: "Web browser",
  86: "TurboGrafx-16/PC Engine",
  87: "Virtual Boy",
  119: "Neo Geo Pocket",
  120: "Neo Geo Pocket Color",
  123: "WonderSwan Color",
  130: "Nintendo Switch",
  137: "New Nintendo 3DS",
  150: "Turbografx-16/PC Engine CD",
  163: "SteamVR",
  165: "PlayStation VR",
  167: "PlayStation 5",
  169: "Xbox Series X|S",
  170: "Google Stadia",
  384: "Oculus Go",
  385: "Oculus Rift",
  386: "Meta Quest 2",
  390: "PlayStation VR2",
  471: "Meta Quest 3",
  472: "visionOS",
  508: "Nintendo Switch 2",
};

const playDateSchema = z.object({
  range_start_date: z.string().nullish(),
  range_end_date: z.string().nullish(),
  start_date: z.string().nullish(),
  finish_date: z.string().nullish(),
});

const playthroughSchema = z.object({
  id: z.number(),
  title: z.string().nullish(),
  platform: z.number().nullish(),
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
  platforms?: string[];
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

function collectPlatforms(entry: BackloggdEntry): string[] {
  const names = Object.values(entry.playthroughs ?? {}).flatMap((playthrough) => {
    const title = playthrough.title?.trim();

    if (title) return [title];

    const name = playthrough.platform ? IGDB_PLATFORM_NAMES[playthrough.platform] : undefined;

    return name ? [name] : [];
  });

  return [...new Set(names)];
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
  const platforms = collectPlatforms(entry);

  return {
    id: entry.id,
    name: entry.name,
    status,
    platforms: platforms.length > 0 ? platforms : undefined,
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

interface GamePlatform {
  name?: string | null;
  slug?: string | null;
}

function matchPlatforms(names: string[] | undefined, available: GamePlatform[]): string[] {
  if (!names?.length) return [];

  const slugByToken = new Map<string, string>();

  for (const platform of available) {
    if (!platform?.slug) continue;

    slugByToken.set(platform.slug.toLowerCase(), platform.slug);

    if (platform.name) slugByToken.set(platform.name.toLowerCase(), platform.slug);
  }

  const matched = names.flatMap((name) => {
    const slug = slugByToken.get(name.toLowerCase());

    return slug ? [slug] : [];
  });

  return [...new Set(matched)];
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
  const game = await withRetry(
    async () => {
      await detailLimiter.acquire(signal);

      onResume();

      const { data } = await api.get(apiEndpoints.getGameDetails(entry.id), { signal });

      const id = data?.game?.id;

      if (!id) throw new Error(MEDIA_NOT_FOUND);

      return { id: id as string, platforms: (data.game.platforms ?? []) as GamePlatform[] };
    },
    signal,
    onRetry,
  );

  const gameId = game.id;
  const platforms = matchPlatforms(entry.platforms, game.platforms);

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
          platforms: platforms.length > 0 ? platforms : undefined,
        },
        { signal },
      ),
    signal,
    onRetry,
  );

  if (entry.rating) {
    await upsertReview(REVIEW_TARGET, gameId, userId, { overall: entry.rating }, signal, onRetry);
  }
}

export function backloggdRunner(userId: string): ImportRunner<MappedEntry> {
  return {
    importEntry: (entry, signal, onRetry, onResume) => importEntry(entry, userId, signal, onRetry, onResume),
    notFoundKey: "settings:import.errors.notFound",
  };
}

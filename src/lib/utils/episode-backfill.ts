export type BackfillPreference = "always" | "never";

const STORAGE_KEY = "trackgeek:episode-backfill";

type BackfillStore = Record<string, BackfillPreference>;

export interface EpisodeRef {
  season: number;
  episode: number;
}

export interface BackfillSeason {
  seasonNumber: number;
  totalEpisodes: number;
  watchedEpisodes: number[];
}

function readStore(): BackfillStore {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BackfillStore) : {};
  } catch {
    return {};
  }
}

export function getBackfillPreference(key: string): BackfillPreference | null {
  return readStore()[key] ?? null;
}

export function setBackfillPreference(key: string, preference: BackfillPreference) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readStore(), [key]: preference }));
  } catch {
    return;
  }
}

export function getUnwatchedPreviousEpisodes(
  seasons: BackfillSeason[],
  targetSeason: number,
  targetEpisode: number,
): EpisodeRef[] {
  const previous: EpisodeRef[] = [];

  for (const season of seasons) {
    const isSpecials = season.seasonNumber === 0;
    const isPreviousSeason = !isSpecials && season.seasonNumber < targetSeason;
    const isCurrentSeason = season.seasonNumber === targetSeason;

    if (!isPreviousSeason && !isCurrentSeason) continue;

    const lastEpisode = isCurrentSeason ? targetEpisode - 1 : season.totalEpisodes;

    for (let episode = 1; episode <= lastEpisode; episode++) {
      if (season.watchedEpisodes.includes(episode)) continue;

      previous.push({ season: season.seasonNumber, episode });
    }
  }

  return previous;
}

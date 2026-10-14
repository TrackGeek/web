interface WatchSeason {
  totalEpisodes: number;
  watchedEpisodes: readonly number[];
}

export function getEpisodeRuntime(duration: string | readonly number[] | null | undefined): number | null {
  if (Array.isArray(duration)) {
    const runtimes = duration.filter((runtime) => Number.isFinite(runtime) && runtime > 0);
    return runtimes.length ? runtimes.reduce((total, runtime) => total + runtime, 0) / runtimes.length : null;
  }

  if (typeof duration !== "string") return null;

  const match = duration
    .trim()
    .match(/^(?:(\d+)\s*hr\.?\s*)?(?:(\d+)\s*min\.?\s*)?(?:(\d+)\s*sec\.?)?(?:\s*per\s*ep\.?)?$/i);
  if (!match) return null;

  const minutes = Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0) + Number(match[3] ?? 0) / 60;
  return minutes > 0 ? minutes : null;
}

export function getRemainingWatchHours(seasons: readonly WatchSeason[], runtime: number | null): number | null {
  if (runtime === null || !Number.isFinite(runtime) || runtime <= 0 || !seasons.length) return null;
  if (seasons.some((season) => !Number.isInteger(season.totalEpisodes) || season.totalEpisodes <= 0)) return null;

  const remainingEpisodes = seasons.reduce((total, season) => {
    const watched = new Set(
      season.watchedEpisodes.filter(
        (episode) => Number.isInteger(episode) && episode >= 1 && episode <= season.totalEpisodes,
      ),
    );
    return total + season.totalEpisodes - watched.size;
  }, 0);

  return Math.ceil((remainingEpisodes * runtime) / 6) / 10;
}

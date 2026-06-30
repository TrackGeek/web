import { Icon } from "@iconify/react";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface SeasonData {
  seasonNumber: number;
  totalEpisodes: number;
  watchedEpisodes: number[];
}

interface EpisodeProgressProps {
  seasons: SeasonData[];

  defaultSeason?: number;

  seasonCustomNames?: Record<number, string>;

  onToggleEpisode: (seasonNumber: number, episode: number) => void;

  onToggleSeason?: (seasonNumber: number, watched: boolean) => void;

  onToggleAll?: (watched: boolean) => void;

  isLoading?: boolean;
}

export function EpisodeProgress({
  seasons,
  defaultSeason,
  seasonCustomNames = {},
  onToggleEpisode,
  onToggleSeason,
  onToggleAll,
  isLoading = false,
}: EpisodeProgressProps) {
  const initialSeason =
    defaultSeason && seasons.find((s) => s.seasonNumber === defaultSeason) ? defaultSeason : seasons[0]?.seasonNumber;

  const [activeSeason, setActiveSeason] = useState<number | null>(initialSeason || null);

  useEffect(() => {
    if (activeSeason !== null) return;
    if (!seasons || seasons.length === 0) return;

    if (defaultSeason && seasons.find((s) => s.seasonNumber === defaultSeason)) {
      setActiveSeason(defaultSeason);
    }
  }, [activeSeason, defaultSeason, seasons]);

  if (!seasons || seasons.length === 0) return null;

  const currentSeasonData = seasons.find((s) => s.seasonNumber === activeSeason);

  if (!currentSeasonData) return null;

  const isSeasonWatched = currentSeasonData.watchedEpisodes.length >= currentSeasonData.totalEpisodes;
  const isAllWatched = seasons.every((s) => s.watchedEpisodes.length >= s.totalEpisodes);

  const getSeasonLabel = (seasonNumber: number) => {
    return seasonCustomNames[seasonNumber] || `${t("library:season")} ${seasonNumber}`;
  };

  const isSeasonActive = (seasonNumber: number) => activeSeason === seasonNumber;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="border-b border-border bg-muted/30">
        <div className="flex overflow-x-auto gap-1 pb-1">
          {seasons.map((season) => {
            const isActive = isSeasonActive(season.seasonNumber);
            const progress = Math.round((season.watchedEpisodes.length / season.totalEpisodes) * 100);

            return (
              <button
                key={season.seasonNumber}
                type="button"
                disabled={isLoading}
                onClick={() => setActiveSeason(season.seasonNumber)}
                className={cn(
                  "flex-1 min-w-[120px] flex flex-col items-center justify-center px-2 py-1 text-sm font-medium transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                )}
              >
                <span className="truncate w-full text-center">{getSeasonLabel(season.seasonNumber)}</span>
                <span className={cn("text-xs mt-1", isActive ? "text-primary" : "text-muted-foreground/70")}>
                  {season.watchedEpisodes.length}/{season.totalEpisodes}
                  {progress > 0 && ` (${progress}%)`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-sm text-muted-foreground">{t("library:selectWatchedEpisodes")}</p>
          <div className="flex items-center gap-2">
            {isLoading && <Icon icon="lucide:loader-2" className="size-4 animate-spin text-primary" />}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onToggleSeason?.(currentSeasonData.seasonNumber, !isSeasonWatched)}
              className="text-sm font-medium text-primary hover:underline cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSeasonWatched
                ? t("library:unmarkSeason")
                : t("library:markSeason", { season: currentSeasonData.seasonNumber })}
            </button>
            <span className="text-muted-foreground/40">•</span>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onToggleAll?.(!isAllWatched)}
              className="text-sm font-medium text-primary hover:underline cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isAllWatched ? t("library:unmarkAll") : t("library:markAll")}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {Array.from({ length: currentSeasonData.totalEpisodes }).map((_, index) => {
            const episode = index + 1;
            const watched = currentSeasonData.watchedEpisodes.includes(episode);

            return (
              <button
                type="button"
                key={episode}
                disabled={isLoading}
                onClick={() => onToggleEpisode(currentSeasonData.seasonNumber, episode)}
                className={cn(
                  "group relative flex items-center justify-center size-10 rounded-lg text-sm font-medium transition-all duration-200 border cursor-pointer disabled:opacity-50 disabled:pointer-events-none",
                  watched
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                )}
                aria-label={watched ? t("library:unmarkEpisode") : t("library:markEpisode")}
              >
                {episode}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

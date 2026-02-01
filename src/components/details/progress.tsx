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

	onToggle: (seasonNumber: number, episode: number) => void;
}

export function EpisodeProgress({
	seasons,
	defaultSeason,
	seasonCustomNames = {},
	onToggle,
}: EpisodeProgressProps) {
	const initialSeason =
		defaultSeason && seasons.find((s) => s.seasonNumber === defaultSeason)
			? defaultSeason
			: seasons[0]?.seasonNumber;

	const [activeSeason, setActiveSeason] = useState<number | null>(
		initialSeason || null,
	);

	useEffect(() => {
		if (
			defaultSeason &&
			seasons.find((s) => s.seasonNumber === defaultSeason)
		) {
			setActiveSeason(defaultSeason);
		}
	}, [defaultSeason, seasons]);

	if (!seasons || seasons.length === 0) {
		return null;
	}

	const currentSeasonData = seasons.find(
		(s) => s.seasonNumber === activeSeason,
	);

	if (!currentSeasonData) {
		return null;
	}

	const getSeasonLabel = (seasonNumber: number) => {
		return (
			seasonCustomNames[seasonNumber] ||
			`${t("library:season")} ${seasonNumber}`
		);
	};

	const isSeasonActive = (seasonNumber: number) =>
		activeSeason === seasonNumber;

	return (
		<div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
			<div className="border-b border-border bg-muted/30 p-1">
				<div className="flex overflow-x-auto gap-1 no-scrollbar">
					{seasons.map((season) => {
						const isActive = isSeasonActive(season.seasonNumber);
						const progress = Math.round(
							(season.watchedEpisodes.length / season.totalEpisodes) * 100,
						);

						return (
							<button
								key={season.seasonNumber}
								type="button"
								onClick={() => setActiveSeason(season.seasonNumber)}
								className={cn(
									"flex-1 min-w-[120px] flex flex-col items-center justify-center px-2 py-1 rounded-lg text-sm font-medium transition-all cursor-pointer",
									isActive
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
								)}
							>
								<span className="truncate w-full text-center">
									{getSeasonLabel(season.seasonNumber)}
								</span>
								<span
									className={cn(
										"text-xs mt-1",
										isActive ? "text-primary" : "text-muted-foreground/70",
									)}
								>
									{season.watchedEpisodes.length}/{season.totalEpisodes}
									{progress > 0 && ` (${progress}%)`}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			<div className="p-3">
				<div className="flex items-center justify-between mb-3">
					<p className="text-sm text-muted-foreground">
						{t("library:selectWatchedEpisodes")}
					</p>
					<p>
						{t("library:markSeason", {
							season: currentSeasonData.seasonNumber,
						})}
					</p>
					<p>{t("library:markAll")}</p>
				</div>

				<div className="flex flex-wrap gap-3">
					{Array.from({ length: currentSeasonData.totalEpisodes }).map(
						(_, index) => {
							const episode = index + 1;
							const watched =
								currentSeasonData.watchedEpisodes.includes(episode);

							return (
								<button
									type="button"
									key={episode}
									onClick={() =>
										onToggle(currentSeasonData.seasonNumber, episode)
									}
									className={cn(
										"group relative flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 border cursor-pointer",
										watched
											? "bg-primary text-primary-foreground border-primary shadow-sm"
											: "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:shadow-sm",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
									)}
									aria-label={
										watched
											? t("library:unmarkEpisode")
											: t("library:markEpisode")
									}
								>
									{episode}
								</button>
							);
						},
					)}
				</div>
			</div>
		</div>
	);
}

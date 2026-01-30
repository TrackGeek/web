import { t } from "i18next";
import { cn } from "@/lib/utils";

export interface SingleSeasonData {
	totalEpisodes: number;
	watchedEpisodes: number[];
}

interface AnimeEpisodeProgressProps {
	season: SingleSeasonData;
	onToggle: (episode: number) => void;
}

export function AnimeEpisodeProgress({
	season,
	onToggle,
}: AnimeEpisodeProgressProps) {
	if (!season || season.totalEpisodes === 0) {
		return null;
	}

	return (
		<div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
			<div className="p-3">
				<div className="flex items-center justify-between mb-3">
					<p className="text-sm text-muted-foreground">
						{t("library:selectWatchedEpisodes")}
					</p>
					<p>{t("library:markAll")}</p>
				</div>

				<div className="flex flex-wrap gap-3">
					{Array.from({ length: season.totalEpisodes }).map((_, index) => {
						const episode = index + 1;
						const watched = season.watchedEpisodes.includes(episode);

						return (
							<button
								type="button"
								key={episode}
								onClick={() => onToggle(episode)}
								className={cn(
									"group relative flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 border",
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
					})}
				</div>
			</div>
		</div>
	);
}
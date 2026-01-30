import { useTranslation } from "react-i18next";

export function EpisodeItem() {
	const { t } = useTranslation();
	return (
		<div className="relative rounded-xl border border-border overflow-hidden aspect-video">
			<div
				className="absolute inset-0 bg-cover bg-center"
				style={{
					backgroundImage: `url("https://simkl.in/episodes/15/15603250b41c27c9bf_w.webp")`,
				}}
			/>
			<div className="relative bg-linear-to-t from-muted/80 via-muted/40 to-transparent p-3 h-full flex flex-col justify-end">
				<p className="font-bold text-card-foreground">The Radio</p>
				<p className="text-muted-foreground font-bold text-sm">{t("library:episode")} 1</p>
			</div>
		</div>
	);
}

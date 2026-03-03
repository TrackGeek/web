import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CardItem } from "@/components/cards/card.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import series from "@/lib/mockups/series.json";

export const Route = createFileRoute("/tv/")({
	component: SerieRoute,
});

function SerieRoute() {
	const { t } = useTranslation();

	return (
		<div className="mx-auto w-full">
			<Carousel
				className="w-full"
				opts={{
					loop: true,
					align: "center",
				}}
			>
				<CarouselContent>
					{series.map((serie) => {
						return (
							<CarouselItem key={serie.id}>
								<div className="relative w-full overflow-hidden rounded-xl border border-border">
									<img
										src={serie.backdropUrl}
										className="w-full h-60 md:h-120 object-cover"
										alt={serie.name}
									/>

									<div className="absolute inset-0 bg-linear-to-t from-malachite-500/80 via-malachite-500/30 to-transparent" />

									<div className="absolute inset-0 p-8 flex flex-col justify-end gap-4">
										<h2 className="text-4xl font-bold drop-shadow-lg">
											{serie.name}
										</h2>

										<div className="max-w-2xl hidden md:block">
											<p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">
												{serie.tagline}
											</p>
										</div>

										<Link
											to={`/tv/${serie.id}`}
											className="bg-primary text-primary-foreground w-fit px-6 py-2 rounded-full font-semibold hover:brightness-110 transition-all shadow-lg"
										>
											{t("common:viewDetails")}
										</Link>
									</div>
								</div>
							</CarouselItem>
						);
					})}
				</CarouselContent>
				<CarouselPrevious
					variant="default"
					className="left-4 bg-white border-none hover:bg-white/80 z-10"
				/>
				<CarouselNext
					variant="default"
					className="right-4 bg-white border-none hover:bg-white/80 z-10"
				/>
			</Carousel>
			<div className="py-6 space-y-4">
				<div className="flex items-center justify-between mb-4">
					<p className="text-2xl font-bold">{t("feed:trending")}</p>
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{series.map((serie) => (
						<CardItem
							title={serie.name}
							url={`/tv/${serie.id}`}
							imageURL={serie.posterUrl}
							rating={serie.rating || 0}
							year={new Date(serie.firstAirDate).getFullYear()}
							synopsis={serie.tagline}
							mediaType={"tv-show"}
							key={serie.id}
						/>
					))}
				</Grid>
				<div className="flex items-center justify-between mb-4">
					<p className="text-2xl font-bold">{t("common:mostPopular")}</p>
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{series.map((serie) => (
						<CardItem
							title={serie.name}
							url={`/tv/${serie.id}`}
							imageURL={serie.posterUrl}
							rating={serie.rating || 0}
							year={new Date(serie.firstAirDate).getFullYear()}
							synopsis={serie.tagline}
							mediaType={"tv-show"}
							key={serie.id}
						/>
					))}
				</Grid>
				<div className="flex items-center justify-between mb-4">
					<p className="text-2xl font-bold">
						{t("library:statusAir.currentlyAiring")}
					</p>
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{series.map((serie) => (
						<CardItem
							title={serie.name}
							url={`/tv/${serie.id}`}
							imageURL={serie.posterUrl}
							rating={serie.rating || 0}
							year={new Date(serie.firstAirDate).getFullYear()}
							synopsis={serie.tagline}
							mediaType={"tv-show"}
							key={serie.id}
						/>
					))}
				</Grid>
				<div className="flex items-center justify-between mb-4">
					<p className="text-2xl font-bold">{t("common:comingSoon")}</p>
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{series.map((serie) => (
						<CardItem
							title={serie.name}
							url={`/tv/${serie.id}`}
							imageURL={serie.posterUrl}
							rating={serie.rating || 0}
							year={new Date(serie.firstAirDate).getFullYear()}
							synopsis={serie.tagline}
							mediaType={"tv-show"}
							key={serie.id}
						/>
					))}
				</Grid>
			</div>
		</div>
	);
}

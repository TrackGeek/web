import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CardItem } from "@/components/shared/cards/card";
import { Grid } from "@/components/layouts/grid";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import gamesData from "@/lib/mockups/games.json";

export const Route = createFileRoute("/game/")({
	component: GameRoute,
});

function GameRoute() {
	const { t } = useTranslation();
	const games = Array.isArray(gamesData) ? gamesData : [gamesData.game];

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
					{games.map((game) => {
						const artworks = Array.isArray(game.artworks) ? game.artworks : [];
						const keyArt = artworks.find(
							(a: any) => a.type === "Key art without logo",
						)?.url;
						const logoArt = artworks.find(
							(a: any) => a.type === "Game logo (color)",
						)?.url;

						return (
							<CarouselItem key={game.id}>
								<div className="relative w-full overflow-hidden rounded-xl border border-border">
									<img
										src={keyArt || artworks[0]?.url || game.coverUrl}
										className="w-full h-60 md:h-120 object-cover object-top"
										alt={game.name}
									/>

									<div className="absolute inset-0 bg-linear-to-t from-malachite-500/80 via-malachite-500/30 to-transparent" />

									<div className="absolute inset-0 p-8 flex flex-col justify-end gap-4">
										{logoArt ? (
											<img
												src={logoArt.replace(".jpg", ".png")}
												className="h-24 object-contain self-start drop-shadow-lg"
												alt={`${game.name} logo`}
											/>
										) : (
											<h2 className="text-4xl font-bold drop-shadow-lg">
												{game.name}
											</h2>
										)}

										<div className="max-w-2xl hidden md:block">
											<p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">
												{game.summary}
											</p>
										</div>

										<Link
											to={`/game/${game.id}`}
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
					<p className="text-2xl font-bold">{t("common:mostPopular")}</p>
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{games.map((game) => (
						<CardItem
							title={game.name}
							url={`/game/${game.id}`}
							imageURL={game.coverUrl}
							rating={game.rating}
							year={new Date(game.releaseDates[0].date).getFullYear()}
							synopsis={game.summary}
							mediaType={"game"}
							key={game.id}
						/>
					))}
				</Grid>
				<div className="flex items-center justify-between mb-4">
					<p className="text-2xl font-bold">{t("common:recentlyReleased")}</p>
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{games.map((game) => (
						<CardItem
							title={game.name}
							url={`/game/${game.id}`}
							imageURL={game.coverUrl}
							rating={game.rating}
							year={new Date(game.releaseDates[0].date).getFullYear()}
							synopsis={game.summary}
							mediaType={"game"}
							key={game.id}
						/>
					))}
				</Grid>
				<div className="flex items-center justify-between mb-4">
					<p className="text-2xl font-bold">{t("common:comingSoon")}</p>
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{games.map((game) => (
						<CardItem
							title={game.name}
							url={`/game/${game.id}`}
							imageURL={game.coverUrl}
							rating={game.rating}
							year={new Date(game.releaseDates[0].date).getFullYear()}
							synopsis={game.summary}
							mediaType={"game"}
							key={game.id}
						/>
					))}
				</Grid>
				<div className="flex items-center justify-between mb-4">
					<p className="text-2xl font-bold">{t("common:mostAnticipated")}</p>
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{games.map((game) => (
						<CardItem
							title={game.name}
							url={`/game/${game.id}`}
							imageURL={game.coverUrl}
							rating={game.rating}
							year={new Date(game.releaseDates[0].date).getFullYear()}
							synopsis={game.summary}
							mediaType={"game"}
							key={game.id}
						/>
					))}
				</Grid>
			</div>
		</div>
	);
}

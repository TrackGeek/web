import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CardItem } from "@/components/cards/card.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { Button } from "@/components/ui/button.tsx";
import mangasData from "@/lib/mockups/mangas.json";

export const Route = createFileRoute("/manga/")({
	component: MangaRoute,
});

function MangaRoute() {
	const { t } = useTranslation();
	const mangas = mangasData;

	return (
		<div className="mx-auto w-full">
			<div className="space-y-4">
				<div className="flex items-center justify-between mb-4">
					<p className="text-2xl font-bold">{t("common:topAiring")}</p>
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{mangas.map((manga) => (
						<CardItem
							title={manga.title}
							url={`/manga/${manga.id}`}
							imageURL={manga.imageUrl}
							rating={manga.rating}
							year={manga.published.prop.from.year}
							synopsis={manga.synopsis}
							mediaType={"manga"}
							key={manga.id}
						/>
					))}
				</Grid>
				<div className="flex items-center justify-between mb-4">
					<p className="text-2xl font-bold">{t("common:recommendations")}</p>{" "}
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{mangas.map((manga) => (
						<CardItem
							title={manga.title}
							url={`/manga/${manga.id}`}
							imageURL={manga.imageUrl}
							rating={manga.rating}
							year={manga.published.prop.from.year}
							synopsis={manga.synopsis}
							mediaType={"manga"}
							key={manga.id}
						/>
					))}
				</Grid>
				<div className="flex items-center justify-between mb-4">
					<p className="text-2xl font-bold">{t("common:comingSoon")}</p>
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{mangas.map((manga) => (
						<CardItem
							title={manga.title}
							url={`/manga/${manga.id}`}
							imageURL={manga.imageUrl}
							rating={manga.rating}
							year={manga.published.prop.from.year}
							synopsis={manga.synopsis}
							mediaType={"manga"}
							key={manga.id}
						/>
					))}
				</Grid>
				<div className="flex items-center justify-between mb-4">
					<p className="text-2xl font-bold">{t("common:topManga")}</p>
					<Button>{t("pages:donate.viewAll")}</Button>
				</div>
				<Grid minColSize={"120px"} className={"grid-cols-5"}>
					{mangas.map((manga) => (
						<CardItem
							title={manga.title}
							url={`/manga/${manga.id}`}
							imageURL={manga.imageUrl}
							rating={manga.rating}
							year={manga.published.prop.from.year}
							synopsis={manga.synopsis}
							mediaType={"manga"}
							key={manga.id}
						/>
					))}
				</Grid>
			</div>
		</div>
	);
}

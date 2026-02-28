"use client";

import { createFileRoute } from "@tanstack/react-router";
import { Clipboard } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CardItem } from "@/components/shared/cards/card";
import { Grid } from "@/components/layouts/grid";
import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getGenreLabel } from "@/lib/utils/genre-utils";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/search")({
	head: (ctx) => {
		const { t } = ctx.useContext();
		return {
			meta: [...seo({ title: t("user:search") })],
		};
	},
	component: RouteComponent,
});

type ContentType = "anime" | "manga" | "book" | "game" | "movie" | "tv";

const CONTENT_TYPES: { value: ContentType; labelKey: string }[] = [
	{ value: "anime", labelKey: "common:types.anime" },
	{ value: "manga", labelKey: "common:types.manga" },
	{ value: "book", labelKey: "common:types.book" },
	{ value: "game", labelKey: "common:types.game" },
	{ value: "movie", labelKey: "common:types.movie" },
	{ value: "tv", labelKey: "common:types.tv" },
];

const GENRE_CONFIG: Record<ContentType, string[]> = {
	anime: [
		"Action",
		"Adventure",
		"Comedy",
		"Drama",
		"Fantasy",
		"Horror",
		"Isekai",
		"Mahou Shoujo",
		"Mecha",
		"Music",
		"Mystery",
		"Psychological",
		"Romance",
		"School",
		"Sci-Fi",
		"Shoujo",
		"Shounen",
		"Slice of Life",
		"Sports",
		"Supernatural",
		"Thriller",
	],
	manga: [
		"Action",
		"Adventure",
		"Comedy",
		"Drama",
		"Fantasy",
		"Historical",
		"Horror",
		"Isekai",
		"Josei",
		"Martial Arts",
		"Mecha",
		"Mystery",
		"Romance",
		"School",
		"Sci-Fi",
		"Shoujo",
		"Shounen",
		"Slice of Life",
		"Sports",
		"Supernatural",
		"Thriller",
	],
	book: [
		"Action",
		"Adventure",
		"Biography",
		"Comedy",
		"Crime",
		"Drama",
		"Fantasy",
		"Historical",
		"Horror",
		"Mystery",
		"Romance",
		"Sci-Fi",
		"Self-Help",
		"Thriller",
		"Young Adult",
	],
	game: [
		"Pinball",
		"Adventure",
		"Indie",
		"Arcade",
		"Visual Novel",
		"Card & Board Game",
		"MOBA",
		"Point-and-click",
		"Fighting",
		"Shooter",
		"Music",
		"Platform",
		"Puzzle",
		"Racing",
		"Real Time Strategy (RTS)",
		"Role-playing (RPG)",
		"Simulator",
		"Sport",
		"Strategy",
		"Turn-based Strategy (TBS)",
		"Tactical",
		"Hack and slash/Beat em up",
		"Quiz/Trivia",
	],
	movie: [
		"Action",
		"Adventure",
		"Animation",
		"Biography",
		"Comedy",
		"Crime",
		"Documentary",
		"Drama",
		"Fantasy",
		"Film-Noir",
		"Horror",
		"Musical",
		"Mystery",
		"Romance",
		"Sci-Fi",
		"Sport",
		"Thriller",
		"War",
		"Western",
	],
	tv: [
		"Action",
		"Adventure",
		"Animation",
		"Biography",
		"Comedy",
		"Crime",
		"Documentary",
		"Drama",
		"Family",
		"Fantasy",
		"History",
		"Horror",
		"Music",
		"Mystery",
		"Romance",
		"Sci-Fi",
		"Sport",
		"Talk-Show",
		"Thriller",
		"War",
		"Western",
	],
};

const YEAR_RANGES: Record<ContentType, { min: number; max: number }> = {
	anime: { min: 1958, max: new Date().getFullYear() + 2 },
	manga: { min: 1858, max: new Date().getFullYear() + 2 },
	book: { min: -3000, max: new Date().getFullYear() },
	game: { min: 1958, max: new Date().getFullYear() + 2 },
	movie: { min: 1888, max: new Date().getFullYear() + 2 },
	tv: { min: 1927, max: new Date().getFullYear() + 2 },
};

const STATUS_OPTIONS: Record<
	ContentType,
	{ value: string; labelKey: string }[]
> = {
	anime: [
		{ value: "notYetAired", labelKey: "library:statusAir.notYetAired" },
		{ value: "currentlyAiring", labelKey: "library:statusAir.currentlyAiring" },
		{ value: "finishedAiring", labelKey: "library:statusAir.finishedAiring" },
	],
	manga: [
		{ value: "notYetPublished", labelKey: "library:statusAir.notYetPublished" },
		{ value: "publishing", labelKey: "library:statusAir.publishing" },
		{ value: "finished", labelKey: "library:statusAir.finished" },
		{ value: "onHiatus", labelKey: "library:statusAir.onHiatus" },
		{ value: "discontinued", labelKey: "library:statusAir.discontinued" },
	],
	book: [
		{ value: "released", labelKey: "library:statusAir.released" },
		{ value: "unreleased", labelKey: "library:statusAir.unreleased" },
	],
	game: [
		{ value: "released", labelKey: "library:statusAir.released" },
		{ value: "unreleased", labelKey: "library:statusAir.unreleased" },
	],
	movie: [
		{ value: "released", labelKey: "library:statusAir.released" },
		{ value: "unreleased", labelKey: "library:statusAir.unreleased" },
	],
	tv: [
		{ value: "notYetAired", labelKey: "library:statusAir.notYetAired" },
		{ value: "currentlyAiring", labelKey: "library:statusAir.currentlyAiring" },
		{ value: "finishedAiring", labelKey: "library:statusAir.finishedAiring" },
	],
};

const SORT_OPTIONS = [
	{ value: "title", labelKey: "user:sort.title" },
	{ value: "lastAdded", labelKey: "user:sort.lastAdded" },
	{ value: "lastUpdated", labelKey: "user:sort.lastUpdated" },
	{ value: "rating", labelKey: "user:sort.rating" },
	{ value: "releaseDate", labelKey: "user:sort.releaseDate" },
	{ value: "popularity", labelKey: "user:sort.popularity" },
];

function RouteComponent() {
	const { t } = useTranslation();
	const [contentType, setContentType] = useState<ContentType>("anime");
	const [searchQuery, setSearchQuery] = useState("");

	const handlePaste = async () => {
		try {
			const text = await navigator.clipboard.readText();
			setSearchQuery(text);
		} catch (err) {
			console.error("Failed to read clipboard:", err);
		}
	};

	const mockResults = [
		{ id: "1", title: "Result 1", image: "/tv.svg", score: 8.5 },
		{ id: "2", title: "Result 2", image: "/logo.svg", score: 9.0 },
		{ id: "3", title: "Result 3", image: "/logo.svg", score: 7.8 },
	];

	const currentGenres = GENRE_CONFIG[contentType];
	const currentStatus = STATUS_OPTIONS[contentType];
	const yearRange = YEAR_RANGES[contentType];

	return (
		<div className="p-4 sm:p-6">
			<div className="max-w-7xl mx-auto">
				<div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-end">
					<div className="w-full sm:w-32">
						<Select
							value={contentType}
							onValueChange={(value) => setContentType(value as ContentType)}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{CONTENT_TYPES.map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{t(type.labelKey)}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="flex-1 relative w-full">
						<Input
							placeholder={`${t("user:search")}...`}
							className="bg-muted/50 flex-1 pr-12"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						<Clipboard
							className="size-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary transition"
							onClick={handlePaste}
							title={t("common:clipboard.paste")}
						/>
					</div>
				</div>

				<div className="flex max-sm:flex-col gap-5">
					<div className="w-full md:w-1/4 flex flex-col gap-6">
						<div className="bg-card rounded-2xl shadow-lg p-6 gap-4 flex flex-col">
							<h5 className="text-md font-semibold text-card-foreground">
								{t("user:filter")}
							</h5>

							<div>
								<h5 className="text-md font-semibold text-card-foreground mb-2">
									{t("library:status")}
								</h5>
								<Select>
									<SelectTrigger className="w-full">
										<SelectValue placeholder={t("library:status")} />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{currentStatus.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{t(option.labelKey)}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							<div>
								<h5 className="text-md font-semibold text-card-foreground mb-2">
									{t("library:genres")}
								</h5>
								<Combobox items={currentGenres} multiple={true}>
									<ComboboxInput
										placeholder={t("library:genres")}
										showClear
										readOnly={true}
									/>
									<ComboboxContent>
										<ComboboxList>
											{currentGenres.map((genre) => (
												<ComboboxItem key={genre} value={genre}>
													{getGenreLabel(t, genre)}
												</ComboboxItem>
											))}
										</ComboboxList>
									</ComboboxContent>
								</Combobox>
							</div>

							<div>
								<h5 className="text-md font-semibold text-card-foreground mb-2">
									{t("library:year")}
								</h5>
								<Input
									type="number"
									placeholder={t("library:year")}
									min={yearRange.min}
									max={yearRange.max}
									className="bg-muted/50"
								/>
							</div>

							<div>
								<h5 className="text-md font-semibold text-card-foreground mb-2">
									{t("user:sort.placeholder")}
								</h5>
								<Select>
									<SelectTrigger className="w-full">
										<SelectValue placeholder={t("user:sort.placeholder")} />
									</SelectTrigger>
									<SelectContent>
										<SelectGroup>
											{SORT_OPTIONS.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{t(option.labelKey)}
												</SelectItem>
											))}
										</SelectGroup>
									</SelectContent>
								</Select>
							</div>

							{contentType === "game" && (
								<>
									<div>
										<h5 className="text-md font-semibold text-card-foreground mb-2">
											{t("library:gameModes")}
										</h5>
										<Select>
											<SelectTrigger className="w-full">
												<SelectValue placeholder={t("library:gameModes")} />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="cooperative">
														{t("library:gameModesList.cooperative")}
													</SelectItem>
													<SelectItem value="singleplayer">
														{t("library:gameModesList.singleplayer")}
													</SelectItem>
													<SelectItem value="multiplayer">
														{t("library:gameModesList.multiplayer")}
													</SelectItem>
													<SelectItem value="mmo">
														{t(
															"library:gameModesList.massivelyMultiplayerOnline",
														)}
													</SelectItem>
													<SelectItem value="battleRoyale">
														{t("library:gameModesList.battleRoyale")}
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									</div>
									<div>
										<h5 className="text-md font-semibold text-card-foreground mb-2">
											{t("library:platforms")}
										</h5>
										<Combobox
											items={[
												"PC",
												"PlayStation 5",
												"Xbox Series X|S",
												"Nintendo Switch",
												"iOS",
												"Android",
											]}
											multiple={true}
										>
											<ComboboxInput
												placeholder={t("library:platforms")}
												showClear
												readOnly={true}
											/>
											<ComboboxContent>
												<ComboboxList>
													{[
														"PC",
														"PlayStation 5",
														"Xbox Series X|S",
														"Nintendo Switch",
														"iOS",
														"Android",
													].map((platform) => (
														<ComboboxItem key={platform} value={platform}>
															{platform}
														</ComboboxItem>
													))}
												</ComboboxList>
											</ComboboxContent>
										</Combobox>
									</div>
								</>
							)}

							{(contentType === "anime" || contentType === "tv") && (
								<div>
									<h5 className="text-md font-semibold text-card-foreground mb-2">
										{t("library:episode_other")}
									</h5>
									<Input
										type="number"
										placeholder={t("common:minEpisodes")}
										min={0}
										className="bg-muted/50"
									/>
								</div>
							)}

							{(contentType === "manga" || contentType === "book") && (
								<div>
									<h5 className="text-md font-semibold text-card-foreground mb-2">
										{t("library:chapters")}
									</h5>
									<Input
										type="number"
										placeholder={t("common:minChapters")}
										min={0}
										className="bg-muted/50"
									/>
								</div>
							)}
						</div>
					</div>

					<Grid minColSize="128px" className="flex-1 md:w-2/3 grid gap-6">
						{mockResults.map((item) => (
							<CardItem
								key={item.id}
								title={item.title}
								url={`/${contentType}/${item.id}`}
								imageURL={item.image}
								rating={item.score}
								year={2024}
								synopsis={item.title}
								mediaType={contentType}
							/>
						))}
					</Grid>
				</div>
			</div>
		</div>
	);
}

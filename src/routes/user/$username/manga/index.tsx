import { createFileRoute } from "@tanstack/react-router";
import axios from "axios";
import { ArrowLeftRight, Dices, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CardItem } from "@/components/cards/card.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { UserLayout } from "@/components/layouts/user";
import { Button } from "@/components/ui/button.tsx";
import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { List } from "@/components/ui/list.tsx";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select.tsx";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";
import { seo } from "@/lib/utils/seo";

const jikanApi = axios.create({
	baseURL: "https://api.jikan.moe/v4",
});

interface Genre {
	mal_id: number;
	type: string;
	name: string;
	url: string;
	count: number;
}

interface GenreResponse {
	data: Genre[];
}

async function fetchMangaGenres(): Promise<GenreResponse> {
	const response = await jikanApi.get<GenreResponse>("/genres/manga");
	return response.data;
}

export const Route = createFileRoute("/user/$username/manga/")({
	head: () => ({
		meta: [...seo({ title: "Manga List" })],
	}),
	loader: async () => {
		const genres = await fetchMangaGenres();
		return { genres };
	},
	component: MangaListRoute,
});

export function MangaListRoute() {
	const { username } = Route.useParams();
	const { genres } = Route.useLoaderData();
	const { t } = useTranslation();

	const user = {
		username,
		avatarUrl: "https://github.com/Kuriel23.png",
		bio: "Apaixonada por anime, leitora ávida e avaliadora. Gosto de slice-of-life e sci-fi. Escrevo reviews detalhadas e listas de favoritos.",
		followers: 324,
		following: 48,
	};

	const medals = [
		{
			id: "m1",
			name: "Top Reviewer",
			description: "100+ reviews and highly rated",
		},
		{
			id: "m2",
			name: "Marathon Watcher",
			description: "1000+ episodes watched",
		},
		{ id: "m3", name: "Community Helper", description: "10 helpful reviews" },
		{ id: "m3", name: "Community Helper", description: "10 helpful reviews" },
	];

	const anime = [
		{ id: "m1", title: "Berserk", image: "/logo.svg", score: 9.2 },
		{ id: "m1", title: "Berserk", image: "/logo.svg", score: 9.2 },
		{ id: "m1", title: "Berserk", image: "/logo.svg", score: 9.2 },
	];

	return (
		<UserLayout user={user} medalsCount={medals.length} entriesCount={5}>
			<div className="flex max-sm:flex-col gap-5">
				<div className="w-full md:w-1/4 flex flex-col gap-6">
					<div className="bg-card rounded-2xl shadow-lg p-6 gap-4 flex flex-col">
						<div className="flex items-center justify-between">
							<h4 className="text-md font-semibold text-card-foreground">
								{t("user:filter")}
							</h4>
							<Button>
								<Dices className={"size-5"} />
							</Button>
						</div>
						<Input
							placeholder={`${t(`user:search`)}...`}
							className="bg-muted/50"
						/>
						<div className="flex items-center justify-between">
							<h5 className="text-md font-semibold text-card-foreground">
								{t("feed:customLists")}
							</h5>
							<div className={"flex gap-2"}>
								<ArrowLeftRight className={"size-5 cursor-pointer"} />
								<Plus className={"size-5 cursor-pointer"} />
							</div>
						</div>
						<div className="flex flex-col gap-1">
							{[
								t("feed:lists.planning"),
								t("feed:lists.reading"),
								t("feed:lists.rereading"),
								t("feed:lists.completed"),
								"Planning with my love",
								"2️⃣0️⃣2️⃣6️⃣",
								t("feed:lists.dropped"),
							].map((listName) => (
								<List
									key={listName}
									name={listName}
									active={listName === t("feed:lists.planning")}
								/>
							))}
						</div>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={t("feed:format")}
									className="w-full"
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value={"manga"}>
										{t("common:types.manga")}
									</SelectItem>
									<SelectItem value={"manhwa"}>
										{t("library:types.Manhwa")}
									</SelectItem>
									<SelectItem value={"manhua"}>
										{t("library:types.Manhua")}
									</SelectItem>
									<SelectItem value={"novel"}>
										{t("library:types.Novel")}
									</SelectItem>
									<SelectItem value={"lightNovel"}>
										{t("library:types.LightNovel")}
									</SelectItem>
									<SelectItem value={"oneshot"}>
										{t("library:types.OneShot")}
									</SelectItem>
									<SelectItem value={"doujinshi"}>
										{t("library:types.Doujinshi")}
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={t("library:status")}
									className="w-full"
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value={"notYetPublished"}>
										{t("library:statusAir.notYetPublished")}
									</SelectItem>
									<SelectItem value={"publishing"}>
										{t("library:statusAir.publishing")}
									</SelectItem>
									<SelectItem value={"finished"}>
										{t("library:statusAir.finished")}
									</SelectItem>
									<SelectItem value={"onHiatus"}>
										{t("library:statusAir.onHiatus")}
									</SelectItem>
									<SelectItem value={"discontinued"}>
										{t("library:statusAir.discontinued")}
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
						<Combobox items={genres.data.map((g) => g.name)} multiple={true}>
							<ComboboxInput
								placeholder={t("library:genres")}
								showClear
								readOnly={true}
							/>
							<ComboboxContent>
								<ComboboxList>
									{genres.data.map((genre) => (
										<ComboboxItem key={genre.mal_id} value={genre.name}>
											{getGenreLabel(t, genre.name)}
										</ComboboxItem>
									))}
								</ComboboxList>
							</ComboboxContent>
						</Combobox>
						<Input
							type={"number"}
							placeholder={`${t(`library:year`)}`}
							min={1950}
							max={new Date().getFullYear() + 1}
						/>
						<Select>
							<SelectTrigger className="w-full">
								<SelectValue
									placeholder={t("user:sort.placeholder")}
									className="w-full"
								/>
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value={"title"}>
										{t("user:sort.title")}
									</SelectItem>
									<SelectItem value={"lastAdded"}>
										{t("user:sort.lastAdded")}
									</SelectItem>
									<SelectItem value={"lastUpdated"}>
										{t("user:sort.lastUpdated")}
									</SelectItem>
									<SelectItem value={"rating"}>
										{t("user:sort.rating")}
									</SelectItem>
									<SelectItem value={"releaseDate"}>
										{t("user:sort.releaseDate")}
									</SelectItem>
									<SelectItem value={"popularity"}>
										{t("user:sort.popularity")}
									</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
				<Grid
					minColSize={"128px"}
					className="flex-1 md:w-2/3 grid grid-cols-1 gap-6"
				>
					{anime.map((f) => (
						<CardItem
							key={f.id}
							title={f.title}
							url={"/"}
							imageURL={f.image}
							rating={f.score ?? 0}
							year={2025}
							synopsis={f.title}
							mediaType={"manga"}
						/>
					))}
				</Grid>
			</div>
		</UserLayout>
	);
}

import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { CardItem } from "@/components/cards/card.tsx";
import { FeedListFollowing } from "@/components/feed/listFollowing.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { UserLayout } from "@/components/layouts/user";
import { CastFavoriteCard } from "@/components/user/CastFavoriteCard.tsx";
import { MedalIcon } from "@/components/user/MedalIcon.tsx";
import { StudioCard } from "@/components/user/StudioCard.tsx";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/user/$username/")({
	head: ({ params }) => ({
		meta: [...seo({ title: `@${params.username}` })],
	}),
	component: UserDetailsRoute,
});

export function UserDetailsRoute() {
	const { username } = Route.useParams();
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

	const animeFavorites = [
		{ id: "a1", title: "Attack on Titan", image: "/tv.svg", score: 9 },
		{ id: "a2", title: "Steins;Gate", image: "/logo.svg", score: 9.5 },
		{ id: "a3", title: "Cowboy Bebop", image: "/logo.svg", score: 9.3 },
	];

	const bookFavorites = [
		{ id: "b1", title: "Norwegian Wood", image: "/logo.svg", score: 8 },
		{ id: "b1", title: "Norwegian Wood", image: "/logo.svg", score: 8 },
		{ id: "b1", title: "Norwegian Wood", image: "/logo.svg", score: 8 },
	];

	const mangaFavorites = [
		{ id: "m1", title: "Berserk", image: "/logo.svg", score: 9.2 },
		{ id: "m1", title: "Berserk", image: "/logo.svg", score: 9.2 },
		{ id: "m1", title: "Berserk", image: "/logo.svg", score: 9.2 },
	];

	const gameFavorites = [
		{ id: "g1", title: "The Last of Us", image: "/logo.svg", score: 9.4 },
		{ id: "g1", title: "The Last of Us", image: "/logo.svg", score: 9.4 },
		{ id: "g1", title: "The Last of Us", image: "/logo.svg", score: 9.4 },
	];

	const serieFavorites = [
		{ id: "s1", title: "Dark", image: "/logo.svg", score: 8.9 },
		{ id: "s1", title: "Dark", image: "/logo.svg", score: 8.9 },
		{ id: "s1", title: "Dark", image: "/logo.svg", score: 8.9 },
	];

	const movieFavorites = [
		{ id: "mv1", title: "Spirited Away", image: "/logo.svg", score: 9.7 },
		{ id: "mv1", title: "Spirited Away", image: "/logo.svg", score: 9.7 },
		{ id: "mv1", title: "Spirited Away", image: "/logo.svg", score: 9.7 },
	];

	const studios = [
		{ id: "st1", title: "Studio Ghibli" },
		{ id: "st2", title: "ufotable" },
		{ id: "st3", title: "Aniplex" },
		{ id: "st1", title: "Studio Ghibli" },
		{ id: "st2", title: "ufotable" },
		{ id: "st3", title: "Aniplex" },
		{ id: "st1", title: "Studio Ghibli" },
		{ id: "st2", title: "ufotable" },
		{ id: "st3", title: "Aniplex" },
	];
	const characters = [
		{
			id: "c1",
			name: "Spike Spiegel",
			image:
				"https://media.themoviedb.org/t/p/w600_and_h900_face/p8VUk0ZSzfAF9uWjWg2jEVpPtTy.jpg",
			link: "/anime/1",
		},
		{
			id: "c2",
			name: "Spike Spiegel",
			image:
				"https://media.themoviedb.org/t/p/w600_and_h900_face/kYRu965Jt11NWWbJ9XtSUOhTkUx.jpg",
			link: "/anime/1",
		},
		{
			id: "c3",
			name: "Spike Spiegel",
			image:
				"https://media.themoviedb.org/t/p/w600_and_h900_face/kYRu965Jt11NWWbJ9XtSUOhTkUx.jpg",
			link: "/anime/1",
		},
		{
			id: "c4",
			name: "Spike Spiegel",
			image:
				"https://media.themoviedb.org/t/p/w600_and_h900_face/kYRu965Jt11NWWbJ9XtSUOhTkUx.jpg",
			link: "/anime/1",
		},
	];
	const staff = [
		{
			id: "sf1",
			name: "Shinichiro Watanabe",
			image: "/logo.svg",
			link: "/anime/1",
		},
	];

	return (
		<UserLayout user={user} medalsCount={medals.length} entriesCount={5}>
			<div className="flex max-sm:flex-col gap-5">
				<div className="w-full md:w-1/3 flex flex-col gap-6">
					<div className="bg-card rounded-2xl shadow-lg p-6">
						<h4 className="text-md font-semibold text-card-foreground mb-3">
							{t("user:bio")}
						</h4>
						<p className="text-muted-foreground leading-relaxed">{user.bio}</p>
					</div>

					<div className="bg-card rounded-2xl shadow-lg p-6">
						<h4 className="text-md font-semibold text-card-foreground mb-3">
							{t("user:medals")}
						</h4>
						<Grid minColSize={"40px"}>
							{medals.map((medal) => (
								<MedalIcon
									key={medal.id}
									name={medal.name}
									description={medal.description}
								/>
							))}
						</Grid>
					</div>

					<div className="bg-card rounded-2xl shadow-lg p-6">
						<h4 className="text-md font-semibold text-card-foreground mb-3">
							{t("user:favorites")}
						</h4>

						{animeFavorites.length > 0 && (
							<div className="mb-4">
								<h5 className="text-sm font-semibold text-card-foreground mb-2">
									{t("common:types.anime_other")}
								</h5>
								<Grid minColSize={"24px"} className="text-sm">
									{animeFavorites.splice(0, 3).map((f) => (
										<CardItem
											key={f.id}
											title={f.title}
											url={"/"}
											imageURL={f.image}
											rating={f.score ?? 0}
											year={2025}
											synopsis={f.title}
											mediaType={"anime"}
										/>
									))}
								</Grid>
							</div>
						)}

						{bookFavorites.length > 0 && (
							<div className="mb-4">
								<h5 className="text-sm font-semibold text-card-foreground mb-2">
									{t("common:types.book_other")}
								</h5>
								<Grid minColSize={"24px"} className="text-sm">
									{bookFavorites.splice(0, 3).map((f) => (
										<CardItem
											key={f.id}
											title={f.title}
											url={"/"}
											imageURL={f.image}
											rating={f.score ?? 0}
											year={2025}
											synopsis={f.title}
											mediaType={"book"}
										/>
									))}
								</Grid>
							</div>
						)}

						{mangaFavorites.length > 0 && (
							<div className="mb-4">
								<h5 className="text-sm font-semibold text-card-foreground mb-2">
									{t("common:types.manga_other")}
								</h5>
								<Grid minColSize={"24px"} className="text-sm">
									{mangaFavorites.splice(0, 3).map((f) => (
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
						)}

						{gameFavorites.length > 0 && (
							<div className="mb-4">
								<h5 className="text-sm font-semibold text-card-foreground mb-2">
									{t("common:types.game_other")}
								</h5>
								<Grid minColSize={"24px"} className="text-sm">
									{gameFavorites.splice(0, 3).map((f) => (
										<CardItem
											key={f.id}
											title={f.title}
											url={"/"}
											imageURL={f.image}
											rating={f.score ?? 0}
											year={2025}
											synopsis={f.title}
											mediaType={"game"}
										/>
									))}
								</Grid>
							</div>
						)}

						{serieFavorites.length > 0 && (
							<div className="mb-4">
								<h5 className="text-sm font-semibold text-card-foreground mb-2">
									{t("common:types.tv_other")}
								</h5>
								<Grid minColSize={"24px"} className="text-sm">
									{serieFavorites.splice(0, 3).map((f) => (
										<CardItem
											key={f.id}
											title={f.title}
											url={"/"}
											imageURL={f.image}
											rating={f.score ?? 0}
											year={2025}
											synopsis={f.title}
											mediaType={"tv-show"}
										/>
									))}
								</Grid>
							</div>
						)}

						{movieFavorites.length > 0 && (
							<div className="mb-4">
								<h5 className="text-sm font-semibold text-card-foreground mb-2">
									{t("common:types.movie_other")}
								</h5>
								<Grid minColSize={"24px"}>
									{movieFavorites.splice(0, 3).map((f) => (
										<CardItem
											key={f.id}
											title={f.title}
											url={"/"}
											imageURL={f.image}
											rating={f.score ?? 0}
											year={2025}
											synopsis={f.title}
											mediaType={"movie"}
										/>
									))}
								</Grid>
							</div>
						)}

						<div className="mt-2">
							<h5 className="text-sm font-semibold text-card-foreground mb-2">
								{t("library:studios")}
							</h5>
							<div className="flex flex-wrap gap-2">
								{studios.slice(0, 10).map((s) => (
									<StudioCard key={s.id} title={s.title} />
								))}
							</div>
						</div>

						<div className="mt-2">
							<h5 className="text-sm font-semibold text-card-foreground">
								{t("library:characters")}
							</h5>
							<Grid minColSize={"96px"} gap={"8px"}>
								{characters.slice(0, 6).map((c) => (
									<CastFavoriteCard
										name={c.name}
										image={c.image}
										link={c.link}
										key={c.id}
									/>
								))}
							</Grid>
						</div>

						<div className="mt-2">
							<h5 className="text-sm font-semibold text-card-foreground">
								{t("library:cast")}
							</h5>
							<Grid minColSize={"96px"} gap={"8px"}>
								{staff.slice(0, 6).map((s) => (
									<CastFavoriteCard
										name={s.name}
										image={s.image}
										link={s.link}
										key={s.id}
									/>
								))}
							</Grid>
						</div>
					</div>
				</div>
				<div className="flex-1 md:w-2/3">
					<FeedListFollowing />
				</div>
			</div>
		</UserLayout>
	);
}

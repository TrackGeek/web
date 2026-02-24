import { createFileRoute } from "@tanstack/react-router";
import { ScreenshotItem } from "@/components/cards/screenshot.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { UserLayout } from "@/components/layouts/user";

export const Route = createFileRoute("/user/$username/screenshots/")({
	head: ({ params }) => ({
		meta: [{ title: `${params.username}'s Screenshots | TrackGeek` }],
	}),
	component: ScreenshotsRoute,
});

export function ScreenshotsRoute() {
	const { username } = Route.useParams();

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
	];

	const gamesWithScreenshots = [
		{
			id: "a1",
			title: "Romeo is a Dead Man",
			image: "https://images.igdb.com/igdb/image/upload/t_original/coakmt.webp",
			images: [
				"https://images.igdb.com/igdb/image/upload/t_720p/sc5rik.webp",
				"https://images.igdb.com/igdb/image/upload/t_720p/sc5ril.webp",
			],
		},
		{
			id: "a2",
			title: "Soul Hackers 2",
			image: "https://images.igdb.com/igdb/image/upload/t_original/co4hzh.webp",
			images: [
				"https://images.igdb.com/igdb/image/upload/t_720p/sc5rik.webp",
				"https://images.igdb.com/igdb/image/upload/t_720p/sc5ril.webp",
			],
		},
		{
			id: "a3",
			title: "Grand Theft Auto VI",
			image: "https://images.igdb.com/igdb/image/upload/t_original/co9rwo.webp",
			images: [
				"https://images.igdb.com/igdb/image/upload/t_720p/sc5rik.webp",
				"https://images.igdb.com/igdb/image/upload/t_720p/sc5ril.webp",
			],
		},
		{
			id: "a4",
			title: "Call of Duty: Black Ops 7",
			image: "https://images.igdb.com/igdb/image/upload/t_original/co9xwv.webp",
			images: [
				"https://images.igdb.com/igdb/image/upload/t_720p/sc5rik.webp",
				"https://images.igdb.com/igdb/image/upload/t_720p/sc5ril.webp",
			],
		},
	];

	return (
		<UserLayout user={user} medalsCount={medals.length} entriesCount={2}>
			<Grid
				minColSize={"128px"}
				className="flex w-full flex-col rounded-2xl py-4 px-2 gap-6"
			>
				{gamesWithScreenshots.map((f) => (
					<ScreenshotItem
						key={f.id}
						title={f.title}
						imageURL={f.image}
						images={f.images}
					/>
				))}
			</Grid>
		</UserLayout>
	);
}

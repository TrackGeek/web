import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	head: () => ({
		title: "Home | TrackGeek",
		meta: [
			{ name: "description", content: "TrackGeek - Track your favorite anime, movies, TV shows, books, manga and games" },
			{ property: "og:title", content: "TrackGeek" },
			{ property: "og:description", content: "Track your favorite anime, movies, TV shows, books, manga and games" },
		],
	}),
	component: HomeRoute,
});

function HomeRoute() {
	return <div></div>;
}

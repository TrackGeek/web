import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/user/$slug")({
	head: () => ({
		title: "User Details | TrackGeek",
		meta: [
			{ name: "description", content: "View user profile and activity" },
			{ property: "og:title", content: "User Details | TrackGeek" },
			{ property: "og:description", content: "View user profile and activity" },
		],
	}),
	component: UserDetailsRoute,
});

export function UserDetailsRoute() {
	const { slug } = Route.useParams();

	return <div className="flex flex-col lg:flex-row gap-8">{slug}</div>;
}

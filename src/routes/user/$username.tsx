import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/user/$username")({
	head: ({ params }) => ({
		meta: [{ title: `@${params.username} | TrackGeek` }],
	}),
	component: UserDetailsRoute,
});

export function UserDetailsRoute() {
	const { username } = Route.useParams();

	return <div className="flex flex-col lg:flex-row gap-8">{username}</div>;
}

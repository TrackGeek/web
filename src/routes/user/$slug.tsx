import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/user/$slug")({
	head: () => ({
		meta: [{ title: "User Details | TrackGeek" }],
	}),
	component: UserDetailsRoute,
});

export function UserDetailsRoute() {
	const { slug } = Route.useParams();

	return <div className="flex flex-col lg:flex-row gap-8">{slug}</div>;
}

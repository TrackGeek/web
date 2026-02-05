import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [{ title: "Home | TrackGeek" }],
	}),
	component: HomeRoute,
});

function HomeRoute() {
	return <div></div>;
}

import { createFileRoute } from "@tanstack/react-router";
import { Counter } from "@/components/sections/counter";
import { CTA } from "@/components/sections/cta";
import { Demo } from "@/components/sections/demo.tsx";
import { Features } from "@/components/sections/features.tsx";
import { Hero } from "@/components/sections/hero";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [{ title: "TrackGeek" }],
	}),
	component: HomeRoute,
});

function HomeRoute() {
	return (
		<main className="antialiased flex flex-col">
			<div className="flex-1">
				<Hero />

				<Counter />

				<Demo />

				<Features />

				<CTA />
			</div>
		</main>
	);
}

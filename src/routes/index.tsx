import { createFileRoute } from "@tanstack/react-router";
import { Counter } from "@/components/pages/home/counter";
import { CTA } from "@/components/pages/home/cta";
import { Demo } from "@/components/pages/home/demo";
import { Features } from "@/components/pages/home/features";
import { Hero } from "@/components/pages/home/hero";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [...seo({ title: "Home" })],
  }),
  component: HomeRoute,
});

function HomeRoute() {
  return (
    <main className="flex flex-col">
      <Hero />

      <Counter />

      <Demo />

      <Features />

      <CTA />
    </main>
  );
}

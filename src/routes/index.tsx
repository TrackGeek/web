import { createFileRoute, redirect } from "@tanstack/react-router";
import { Counter } from "@/components/pages/home/counter";
import { CTA } from "@/components/pages/home/cta";
import { Demo } from "@/components/pages/home/demo";
import { Features } from "@/components/pages/home/features";
import { Hero } from "@/components/pages/home/hero";
import { authClient } from "@/lib/auth.ts";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/")({
  staticData: { layout: "full" },
  validateSearch: (search) => ({
    landing: search.landing as string | undefined,
  }),
  beforeLoad: async ({ search }) => {
    // The session cookie lives on the API origin, so the server can never read it.
    // Resolve the redirect on the client and let the server render the landing page.
    if (typeof window === "undefined") {
      return;
    }

    const { data } = await authClient.getSession();
    if (data?.session && !search.landing) {
      throw redirect({ to: "/feed" });
    }
  },
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

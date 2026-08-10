import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Counter } from "@/components/pages/home/counter";
import { CTA } from "@/components/pages/home/cta";
import { Demo } from "@/components/pages/home/demo";
import { Features } from "@/components/pages/home/features";
import { Hero } from "@/components/pages/home/hero";
import { authClient, useSession } from "@/lib/auth/client";
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
  const { landing } = Route.useSearch();
  const navigate = useNavigate();
  const session = useSession();
  const isAuthenticated = !!session.data?.session;

  // beforeLoad only covers client-side navigations: on a direct hit the match is
  // hydrated from the server render, where the session is unreadable.
  useEffect(() => {
    if (isAuthenticated && !landing) {
      navigate({ to: "/feed", replace: true });
    }
  }, [isAuthenticated, landing, navigate]);

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

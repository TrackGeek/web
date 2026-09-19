import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Counter } from "@/components/pages/home/counter";
import { CTA } from "@/components/pages/home/cta";
import { Demo } from "@/components/pages/home/demo";
import { FAQ } from "@/components/pages/home/faq";
import { Features } from "@/components/pages/home/features";
import { Hero } from "@/components/pages/home/hero";
import { Trust } from "@/components/pages/home/trust";
import { authClient, useSession } from "@/lib/auth/client";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/")({
  staticData: { layout: "full" },
  validateSearch: (search) => ({
    landing: search.landing as string | undefined,
  }),
  beforeLoad: async ({ search }) => {
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

      <Trust />

      <FAQ />

      <CTA />
    </main>
  );
}

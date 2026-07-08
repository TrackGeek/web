import "@/lib/i18n/config";
import "@/global.css";

import { createRootRouteWithContext, HeadContent, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "@/components/layouts";
import type { authClient } from "@/lib/auth";
import { RootProvider } from "@/providers";

interface RouterContext {
  auth: typeof authClient;
}

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    layout?: "full" | "main";
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const layout = useRouterState({
    select: (s) => s.matches.at(-1)?.staticData.layout ?? "main",
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      document.querySelectorAll(".asw-menu").forEach((el) => {
        // @ts-expect-error
        el.style.setProperty("--asw-primary", "var(--color-malachite-500)");
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <HeadContent />

      <RootProvider>
        <Layout variant={layout}>
          <Outlet />
        </Layout>
      </RootProvider>
    </>
  );
}

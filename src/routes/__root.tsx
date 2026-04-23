import "@/lib/i18n/config";
import "@/global.css";

import { createRootRouteWithContext, HeadContent, Outlet, useRouterState } from "@tanstack/react-router";
import { HomeLayout } from "@/components/layouts/home";
import { MainLayout } from "@/components/layouts/main";
import type { authClient } from "@/lib/auth";
import { RootProvider } from "@/providers";

interface RouterContext {
  auth: typeof authClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const { location } = useRouterState();

  const isHome = location.pathname === "/";

  const observer = new MutationObserver(() => {
    document.querySelectorAll(".asw-menu").forEach((el) => {
      // @ts-expect-error
      el.style.setProperty("--asw-primary", "var(--color-malachite-500)");
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return (
    <>
      <HeadContent />

      <RootProvider>
        {isHome ? (
          <HomeLayout>
            <Outlet />
          </HomeLayout>
        ) : (
          <MainLayout>
            <Outlet />
          </MainLayout>
        )}
      </RootProvider>
    </>
  );
}

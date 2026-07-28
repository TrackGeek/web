import "@/lib/i18n/config";

import { createRootRouteWithContext, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { Layout } from "@/components/layouts";
import appCss from "@/global.css?url";
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
  ssr: "data-only",
  head: () => ({
    meta: [
      { charSet: "UTF-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "theme-color", content: "#10b981" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&family=Noto+Color+Emoji&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
    scripts: [
      {
        src: "https://cdn.jsdelivr.net/npm/sienna-accessibility@latest/dist/sienna-accessibility.umd.js",
        defer: true,
      },
    ],
  }),
  shellComponent: RootDocument,
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
    <RootProvider>
      <Layout variant={layout}>
        <Outlet />
      </Layout>
    </RootProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        
        <script
          defer
          src="https://dataxamas.izakdvlpr.com/dataxamas.js"
          data-website-id="79d10439-c84b-4ad9-9975-2d37a4be946e"
          data-allow-localhost="false"
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

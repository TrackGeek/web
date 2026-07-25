import { createRouter } from "@tanstack/react-router";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { authClient } from "@/lib/auth";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    context: {
      auth: authClient,
    },
    defaultNotFoundComponent: () => {
      return <NotFoundComponent />;
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

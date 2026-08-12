import { createRouter, parseSearchWith, stringifySearchWith } from "@tanstack/react-router";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { authClient } from "@/lib/auth/client";
import { routeTree } from "./routeTree.gen";

function parseSearchValue(value: string) {
  const parsed = JSON.parse(value);

  if (parsed !== null && typeof parsed === "object") return parsed;
  if (JSON.stringify(parsed) !== value) throw new Error("non-canonical JSON value");

  return parsed;
}

export function getRouter() {
  return createRouter({
    routeTree,
    parseSearch: parseSearchWith(parseSearchValue),
    stringifySearch: stringifySearchWith(JSON.stringify, parseSearchValue),
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

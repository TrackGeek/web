import { createRouter, parseSearchWith, stringifySearchWith } from "@tanstack/react-router";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { exceptions } from "@/dataxamas";
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
    scrollRestorationBehavior: "smooth",
    context: {
      auth: authClient,
    },
    defaultNotFoundComponent: () => {
      return <NotFoundComponent />;
    },
    defaultOnCatch: (error) => {
      void exceptions?.captureException(error);
    },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

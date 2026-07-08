import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";

interface TanstackDevtoolsProviderProps {
  children: ReactNode;
}

export function TanstackDevtoolsProvider({ children }: TanstackDevtoolsProviderProps) {
  return (
    <>
      <TanStackDevtools
        config={{
          position: "bottom-right",
          theme: "dark",
        }}
        plugins={[
          {
            name: "TanStack Router",
            render: <TanStackRouterDevtoolsPanel />,
          },
          {
            name: "TanStack Query",
            render: <ReactQueryDevtoolsPanel theme="dark" />,
          },
        ]}
      />

      {children}
    </>
  );
}

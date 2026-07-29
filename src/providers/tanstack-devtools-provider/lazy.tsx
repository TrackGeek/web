import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

export default function TanstackDevtools() {
  return (
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
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/og/user/$username")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { renderUserOg } = await import("@/lib/og/render");

        return renderUserOg(params.username);
      },
    },
  },
});

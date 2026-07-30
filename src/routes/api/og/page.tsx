import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/og/page")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { renderPageOg } = await import("@/lib/og/render");
        const params = new URL(request.url).searchParams;

        return renderPageOg(params.get("title") ?? "TrackGeek", params.get("description"));
      },
    },
  },
});

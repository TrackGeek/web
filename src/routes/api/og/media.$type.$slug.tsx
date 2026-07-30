import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/og/media/$type/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { isOgMediaType } = await import("@/lib/og/media-source");

        if (!isOgMediaType(params.type)) {
          return new Response("Unknown media type", { status: 404 });
        }

        const { renderMediaOg } = await import("@/lib/og/render");

        return renderMediaOg(params.type, params.slug);
      },
    },
  },
});

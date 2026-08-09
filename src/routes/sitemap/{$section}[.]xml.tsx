import { createFileRoute } from "@tanstack/react-router";
import { getSectionEntries, isSitemapSection, renderUrlset, resolveSiteUrl, xmlResponse } from "@/lib/utils/sitemap";

export const Route = createFileRoute("/sitemap/{$section}.xml")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { section } = params;

        if (!isSitemapSection(section)) return new Response("Not Found", { status: 404 });

        const entries = await getSectionEntries(section);

        return xmlResponse(renderUrlset(resolveSiteUrl(request), entries));
      },
    },
  },
});

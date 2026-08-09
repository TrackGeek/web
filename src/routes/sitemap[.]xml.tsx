import { createFileRoute } from "@tanstack/react-router";
import { renderSitemapIndex, resolveSiteUrl, SITEMAP_SECTIONS, xmlResponse } from "@/lib/utils/sitemap";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const siteUrl = resolveSiteUrl(request);
        const paths = SITEMAP_SECTIONS.map((section) => `/sitemap/${section}.xml`);

        return xmlResponse(renderSitemapIndex(siteUrl, paths));
      },
    },
  },
});

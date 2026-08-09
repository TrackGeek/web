import { createFileRoute } from "@tanstack/react-router";
import { resolveSiteUrl } from "@/lib/utils/sitemap";

const DISALLOWED = [
  "/api/",
  "/settings",
  "/billing",
  "/notifications",
  "/reset-password",
  "/donate/success",
  "/donate/error",
  "/search",
];

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const siteUrl = resolveSiteUrl(request);

        const body = [
          "User-agent: *",
          "Allow: /",
          ...DISALLOWED.map((path) => `Disallow: ${path}`),
          "",
          `Sitemap: ${siteUrl}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});

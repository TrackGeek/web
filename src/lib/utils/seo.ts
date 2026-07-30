import { OG_IMAGE_SIZE, ogUrl } from "@/lib/og/url";

interface SeoOptions {
  title: string;
  description?: string;
  image?: string;
  keywords?: string;
}

export const seo = ({
  title,
  description = "The ultimate tracker for anime, games, movies, TV shows, manga, and books. Discover stats, connect with friends, and never lose track of your progress. Open-source, self-hostable, and free.",
  keywords = "media tracker, open-source, self-hostable, progress tracker, anime list, game backlog, movie watchlist, TV show stats, manga tracker, book tracker, privacy-focused, entertainment dashboard",
  image,
}: SeoOptions) => {
  const origin = typeof window !== "undefined" ? window.location.origin : (import.meta.env.VITE_SITE_URL ?? "");
  const url = typeof document !== "undefined" ? document.URL : "";
  const card = image ?? ogUrl.page(title, description);
  const resolvedImage = card.startsWith("http") ? card : `${origin}${card}`;

  return [
    { title: `TrackGeek » ${title}` },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: `TrackGeek » ${title}` },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: "@TrackGeekOfc" },
    { name: "twitter:site", content: "@TrackGeekOfc" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: resolvedImage },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "TrackGeek" },
    { property: "og:title", content: `TrackGeek » ${title}` },
    { property: "og:description", content: description },
    { property: "og:image", content: resolvedImage },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: String(OG_IMAGE_SIZE.width) },
    { property: "og:image:height", content: String(OG_IMAGE_SIZE.height) },
    { property: "og:image:alt", content: `TrackGeek » ${title}` },
  ];
};

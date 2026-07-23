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
  image = "/logo-128.png",
}: SeoOptions) => {
  const url = typeof document !== "undefined" ? document.URL : "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const resolvedImage = image?.startsWith("http") ? image : `${origin}${image}`;

  return [
    { title: `TrackGeek » ${title}` },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "twitter:url", content: url },
    { name: "twitter:title", content: `TrackGeek » ${title}` },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: "@TrackGeekOfc" },
    { name: "twitter:site", content: "@TrackGeekOfc" },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "TrackGeek" },
    { property: "og:title", content: `TrackGeek » ${title}` },
    { property: "og:description", content: description },
    ...(resolvedImage
      ? [
          { name: "twitter:image", content: resolvedImage },
          { name: "twitter:card", content: "summary_large_image" },
          { property: "og:image", content: resolvedImage },
        ]
      : []),
  ];
};

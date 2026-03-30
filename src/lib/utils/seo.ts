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
}: SeoOptions) => [
  { title: `TrackGeek » ${title}` },
  { name: "description", content: description },
  { name: "keywords", content: keywords },
  { name: "twitter:url", content: document.URL },
  { name: "twitter:title", content: title },
  { name: "twitter:description", content: description },
  { name: "twitter:creator", content: "@TrackGeekOfc" },
  { name: "twitter:site", content: "@TrackGeekOfc" },
  { name: "og:url", content: document.URL },
  { name: "og:type", content: "website" },
  { name: "og:title", content: title },
  { name: "og:description", content: description },
  ...(image
    ? [
        { name: "twitter:image", content: image },
        { name: "twitter:card", content: "summary" },
        { name: "og:image", content: image },
      ]
    : []),
];

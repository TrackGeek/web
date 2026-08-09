import { CONTENT_TYPE_SLUGS, type ContentTypeSlug } from "@/lib/content-types";

export interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

export const SITEMAP_SECTIONS = ["pages", ...CONTENT_TYPE_SLUGS, "user"] as const;

export type SitemapSection = (typeof SITEMAP_SECTIONS)[number];

const PAGE_BATCH_SIZE = 25;
const ITEMS_PER_PAGE = 50;
const MAX_URLS = 45000;
const MAX_PAGES = Math.ceil(MAX_URLS / ITEMS_PER_PAGE);
const CACHE_TTL = 60 * 60 * 1000;

const cache = new Map<SitemapSection, { expiresAt: number; entries: SitemapEntry[] }>();

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: 1 },
  { path: "/feed", changefreq: "hourly", priority: 0.8 },
  { path: "/compare", changefreq: "monthly", priority: 0.5 },
  { path: "/add-data", changefreq: "monthly", priority: 0.4 },
  { path: "/credits", changefreq: "monthly", priority: 0.3 },
  { path: "/donate", changefreq: "monthly", priority: 0.3 },
  { path: "/privacy-policy", changefreq: "yearly", priority: 0.2 },
  { path: "/tos", changefreq: "yearly", priority: 0.2 },
  { path: "/movie", changefreq: "daily", priority: 0.9 },
  { path: "/movie/airing", changefreq: "daily", priority: 0.7 },
  { path: "/movie/upcoming", changefreq: "daily", priority: 0.7 },
  { path: "/movie/trending", changefreq: "daily", priority: 0.7 },
  { path: "/movie/popular", changefreq: "daily", priority: 0.7 },
  { path: "/tv", changefreq: "daily", priority: 0.9 },
  { path: "/tv/airing", changefreq: "daily", priority: 0.7 },
  { path: "/tv/upcoming", changefreq: "daily", priority: 0.7 },
  { path: "/tv/trending", changefreq: "daily", priority: 0.7 },
  { path: "/tv/popular", changefreq: "daily", priority: 0.7 },
  { path: "/game", changefreq: "daily", priority: 0.9 },
  { path: "/game/popular", changefreq: "daily", priority: 0.7 },
  { path: "/game/upcoming", changefreq: "daily", priority: 0.7 },
  { path: "/game/anticipated", changefreq: "daily", priority: 0.7 },
  { path: "/game/recent", changefreq: "daily", priority: 0.7 },
  { path: "/anime", changefreq: "daily", priority: 0.9 },
  { path: "/anime/airing", changefreq: "daily", priority: 0.7 },
  { path: "/anime/top", changefreq: "daily", priority: 0.7 },
  { path: "/anime/upcoming", changefreq: "daily", priority: 0.7 },
  { path: "/anime/recommendations", changefreq: "daily", priority: 0.7 },
  { path: "/manga", changefreq: "daily", priority: 0.9 },
  { path: "/manga/publishing", changefreq: "daily", priority: 0.7 },
  { path: "/manga/top", changefreq: "daily", priority: 0.7 },
  { path: "/manga/upcoming", changefreq: "daily", priority: 0.7 },
  { path: "/manga/recommendations", changefreq: "daily", priority: 0.7 },
  { path: "/book", changefreq: "daily", priority: 0.9 },
  { path: "/book/trending", changefreq: "daily", priority: 0.7 },
  { path: "/book/upcoming", changefreq: "daily", priority: 0.7 },
];

const MEDIA_SOURCES: Record<ContentTypeSlug, { collection: string; idKeys: string[] }> = {
  movie: { collection: "movies", idKeys: ["tmdbId"] },
  tv: { collection: "tvShows", idKeys: ["tmdbId"] },
  game: { collection: "games", idKeys: ["igdbId"] },
  anime: { collection: "animes", idKeys: ["malId"] },
  manga: { collection: "mangas", idKeys: ["anilistId", "malId"] },
  book: { collection: "books", idKeys: ["hardcoverId"] },
};

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);
}

export function isSitemapSection(value: string): value is SitemapSection {
  return (SITEMAP_SECTIONS as readonly string[]).includes(value);
}

export function resolveSiteUrl(request: Request): string {
  const configured = import.meta.env.VITE_SITE_URL ?? "";

  return (configured || new URL(request.url).origin).replace(/\/+$/, "");
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

export function renderSitemapIndex(siteUrl: string, paths: string[]): string {
  const lastmod = new Date().toISOString();

  const sitemaps = paths
    .map(
      (path) =>
        `  <sitemap>\n    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemaps}\n</sitemapindex>\n`;
}

export function renderUrlset(siteUrl: string, entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const parts = [`    <loc>${escapeXml(`${siteUrl}${entry.path}`)}</loc>`];

      if (entry.lastmod) parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
      if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
      if (entry.priority != null) parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);

      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function fetchPage(baseUrl: string, path: string, collection: string, page: number, query?: string) {
  const url = new URL(`${baseUrl.replace(/\/+$/, "")}${path}`);

  url.searchParams.set("page", String(page));
  url.searchParams.set("itemsPerPage", String(ITEMS_PER_PAGE));

  if (query != null) url.searchParams.set("query", query);

  const response = await fetch(url, { headers: { "X-TrackGeek-Version": "1.0.0" } });

  if (!response.ok) return [];

  const payload = (await response.json()) as Record<string, { items?: Record<string, unknown>[] }>;

  return payload?.[collection]?.items ?? [];
}

async function fetchAllItems(path: string, collection: string, query?: string): Promise<Record<string, unknown>[]> {
  const baseUrl = import.meta.env.VITE_API_URL ?? "";

  if (!baseUrl) return [];

  const items: Record<string, unknown>[] = [];

  for (let page = 1; page <= MAX_PAGES; page += PAGE_BATCH_SIZE) {
    const size = Math.min(PAGE_BATCH_SIZE, MAX_PAGES - page + 1);
    const batch = await Promise.all(
      Array.from({ length: size }, (_, offset) => fetchPage(baseUrl, path, collection, page + offset, query)),
    );

    for (const pageItems of batch) items.push(...pageItems);

    if (batch.every((pageItems) => pageItems.length === 0)) break;
  }

  return items;
}

function toLastmod(item: Record<string, unknown>): string | undefined {
  const value = item.updatedAt;

  return typeof value === "string" && value ? new Date(value).toISOString() : undefined;
}

async function getMediaEntries(type: ContentTypeSlug): Promise<SitemapEntry[]> {
  const { collection, idKeys } = MEDIA_SOURCES[type];
  const items = await fetchAllItems(`/${type}/search`, collection);

  return items.flatMap((item) => {
    const id = idKeys.map((key) => item[key]).find((value) => value != null);

    if (id == null) return [];

    return [{ path: `/${type}/${id}`, lastmod: toLastmod(item), changefreq: "weekly", priority: 0.6 } as SitemapEntry];
  });
}

async function getUserEntries(): Promise<SitemapEntry[]> {
  const items = await fetchAllItems("/user/search", "users", "");

  return items.flatMap((item) => {
    const username = item.username;

    if (typeof username !== "string" || !username) return [];

    return [{ path: `/user/${encodeURIComponent(username)}`, changefreq: "weekly", priority: 0.5 } as SitemapEntry];
  });
}

export async function getSectionEntries(section: SitemapSection): Promise<SitemapEntry[]> {
  if (section === "pages") return STATIC_ENTRIES;

  const cached = cache.get(section);

  if (cached && cached.expiresAt > Date.now()) return cached.entries;

  try {
    const collected = section === "user" ? await getUserEntries() : await getMediaEntries(section);
    const entries = collected.slice(0, MAX_URLS);

    cache.set(section, { expiresAt: Date.now() + CACHE_TTL, entries });

    return entries;
  } catch {
    return cached?.entries ?? [];
  }
}

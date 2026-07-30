import type { FontLoader, ImagesInput } from "takumi-js";
import { googleFonts } from "takumi-js/helpers";
import logoSvg from "../../../public/logo.svg?raw";

type OgImageSource = { src: string; data: Uint8Array | (() => Uint8Array | Promise<Uint8Array>) };

export const OG_LOGO_SRC = "trackgeek://logo";

const DEFAULT_IMAGE_HOSTS = [
  "cdn.jsdelivr.net",
  "image.tmdb.org",
  "media.themoviedb.org",
  "images.igdb.com",
  "cdn.myanimelist.net",
  "s4.anilist.co",
  "assets.hardcover.app",
  "i.ibb.co",
];

const MAX_CACHED_FETCHES = 128;

let fontsPromise: Promise<FontLoader[]> | null = null;

export function ogFonts() {
  fontsPromise ??= googleFonts([{ name: "Archivo", weight: [400, 500, 600, 700, 800], style: "normal" }]).catch(
    (error) => {
      fontsPromise = null;
      throw error;
    },
  );

  return fontsPromise;
}

function allowedHosts() {
  const extra = (import.meta.env.VITE_OG_IMAGE_HOSTS ?? "")
    .split(",")
    .map((host: string) => host.trim().toLowerCase())
    .filter(Boolean);

  const apiHost = safeHost(import.meta.env.VITE_API_URL);
  const siteHost = safeHost(import.meta.env.VITE_SITE_URL);

  return new Set([...DEFAULT_IMAGE_HOSTS, ...extra, ...(apiHost ? [apiHost] : []), ...(siteHost ? [siteHost] : [])]);
}

function safeHost(value: string | undefined) {
  if (!value) return null;

  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

let hosts: Set<string> | null = null;

function allowUrl(url: string) {
  hosts ??= allowedHosts();

  try {
    const parsed = new URL(url);

    return parsed.protocol === "https:" && hosts.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

const fetchCache = new Map<string, Promise<ArrayBuffer>>();

const boundedFetchCache = {
  get: (url: string) => fetchCache.get(url),
  set: (url: string, data: Promise<ArrayBuffer>) => {
    if (fetchCache.size >= MAX_CACHED_FETCHES) {
      const oldest = fetchCache.keys().next();

      if (!oldest.done) fetchCache.delete(oldest.value);
    }

    fetchCache.set(url, data);
  },
  delete: (url: string) => fetchCache.delete(url),
};

const logoSource: OgImageSource = {
  src: OG_LOGO_SRC,
  data: () => new TextEncoder().encode(logoSvg),
};

export function ogImages(sources: OgImageSource[] = []): ImagesInput {
  return {
    sources: [logoSource, ...sources],
    fetchCache: boundedFetchCache,
    timeout: 4000,
    maxBytes: 8 * 1024 * 1024,
    allowUrl,
  };
}

export function safeImageUrl(url: string | null | undefined) {
  if (!url) return null;

  return allowUrl(url) ? url : null;
}

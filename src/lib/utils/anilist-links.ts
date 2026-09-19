const ANILIST_HOSTS = new Set(["anilist.co", "www.anilist.co"]);

const ANILIST_PATH_MAP: Record<string, string> = {
  staff: "/manga/cast",
  manga: "/manga",
};

export function internalAnilistPath(href: string | undefined | null): string | null {
  if (!href) return null;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }

  if (!ANILIST_HOSTS.has(url.hostname)) return null;

  const [type, id] = url.pathname.split("/").filter(Boolean);
  const base = ANILIST_PATH_MAP[type];
  if (!base || !id || !/^\d+$/.test(id)) return null;

  return `${base}/${id}`;
}

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const OG_FONT_FAMILY = "Archivo";

export const OG_COLORS = {
  background: "#09090b",
  surface: "#18181b",
  surfaceElevated: "#27272a",
  outline: "#3f3f46",
  primary: "#10b981",
  primarySoft: "#34d399",
  primaryDeep: "#047857",
  foreground: "#fafafa",
  muted: "#a1a1aa",
  mutedStrong: "#71717a",
} as const;

export const OG_CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

export function truncate(value: string | null | undefined, max: number) {
  const text = (value ?? "").replace(/\s+/g, " ").trim();

  if (text.length <= max) return text;

  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function formatCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 999_500) return "1M";
  if (value >= 10_000) return `${(value / 1_000).toFixed(0)}K`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;

  return String(value);
}

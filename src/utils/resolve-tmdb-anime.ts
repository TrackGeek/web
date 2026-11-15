import { api } from "@/lib/api";

export interface CanonicalAnime {
  type: "anime";
  malId: number;
  path: string;
}

export async function resolveTmdbAnime(type: "movie" | "tv", tmdbId: string): Promise<CanonicalAnime | null> {
  if (!/^[1-9]\d*$/.test(tmdbId)) return null;
  const { data } = await api.get<{ anime: CanonicalAnime | null }>(`/anime/resolve/${type}/${tmdbId}`);
  return data.anime;
}

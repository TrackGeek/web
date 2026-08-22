import type { ApiTypes } from "@/lib/api";

export type MediaKind = ApiTypes.ReviewContentType;

const UNRELEASED_STATUSES: Record<MediaKind, string[]> = {
  anime: ["Not yet aired"],
  manga: ["Not yet published"],
  tv: ["Planned", "In Production", "Pilot"],
  movie: ["Planned", "In Production", "Post Production", "Rumored"],
  game: ["Not Released", "Rumored", "Offline"],
  book: [],
};

interface ReleaseInfo {
  status?: string | null;
  releaseDate?: string | Date | null;
  releaseYear?: number | null;
}

function isBookUnreleased({ releaseDate, releaseYear }: ReleaseInfo): boolean {
  if (releaseDate) return new Date(releaseDate).getTime() > Date.now();
  if (releaseYear != null) return releaseYear > new Date().getUTCFullYear();

  return false;
}

export function isMediaUnreleased(type: MediaKind, info: ReleaseInfo): boolean {
  if (type === "book") return isBookUnreleased(info);

  return !info.status || UNRELEASED_STATUSES[type].includes(info.status);
}

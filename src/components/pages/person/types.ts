export type PersonCreditMediaType = "movie" | "tv" | "anime";

export interface PersonCredit {
  key: string;
  mediaType: PersonCreditMediaType;
  id: number;
  title: string;
  imageUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  year: number | null;
  roles: string[];
  isCast: boolean;
  isAdult: boolean;
  episodeCount: number | null;
  externalReviewScore: number | null;
  popularity: number | null;
  tgReviewScore: number;
  isTracked: boolean;
}

export interface PersonStats {
  total: number;
  movies: number;
  tvShows: number;
  anime: number;
  tracked: number;
}

export interface Person {
  id: string;
  slug: string;
  name: string;
  tmdbId: number | null;
  malId: number | null;
  imageUrl: string | null;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string | null;
  alsoKnownAs: string[];
  gender: number | null;
  homepage: string | null;
  popularity: number | null;
  images: string[];
  external: Record<string, string | null> | null;
  source: "tmdb" | "mal";
  credits: PersonCredit[];
  stats: PersonStats;
}

export type CompanyMediaType = "movie" | "tv" | "anime" | "game";

export interface CompanyWork {
  key: string;
  id: number;
  title: string;
  imageUrl: string | null;
  backdropUrl: string | null;
  releaseDate: string | null;
  year: number | null;
  roles: string[];
  isAdult: boolean;
  externalReviewScore: number | null;
  tgReviewScore: number;
  isTracked: boolean;
}

export interface CompanyExternalLink {
  name: string;
  url: string;
}

export interface Company {
  id: number;
  mediaType: CompanyMediaType;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  originCountry: string | null;
  headquarters: string | null;
  homepage: string | null;
  foundedAt: string | null;
  alsoKnownAs: string[];
  external: CompanyExternalLink[];
  works: CompanyWork[];
  stats: {
    total: number;
    tracked: number;
  };
}

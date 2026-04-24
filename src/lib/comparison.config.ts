export type ComparisonSupport = "yes" | "no" | "partial";

export interface ComparisonPlatform {
  id: string;
  name: string;
  isTrackGeek?: boolean;
}

export interface ComparisonCriterion {
  id: string;
}

export interface ComparisonEntry {
  criterionId: ComparisonCriterion["id"];
  platformId: ComparisonPlatform["id"];
  support: ComparisonSupport;
  note?: string;
}

export const comparisonPlatforms: ComparisonPlatform[] = [
  {
    id: "trackgeek",
    name: "TrackGeek",
    isTrackGeek: true,
  },
  {
    id: "anilist",
    name: "AniList",
  },
  {
    id: "simkl",
    name: "Simkl",
  },
  {
    id: "mylists",
    name: "MyLists",
  },
  {
    id: "backloggd",
    name: "Backloggd",
  },
  {
    id: "storygraph",
    name: "StoryGraph",
  },
];

export const comparisonCriteria: ComparisonCriterion[] = [
  { id: "anime" },
  { id: "manga" },
  { id: "books" },
  { id: "games" },
  { id: "movies" },
  { id: "series" },
  { id: "granular-progress" },
  { id: "reviews" },
  { id: "custom-lists" },
  { id: "public-profile" },
  { id: "public-api" },
  { id: "feed" },
  { id: "mobile" },
  { id: "import-export" },
];

export const comparisonEntries: ComparisonEntry[] = [
  { criterionId: "anime", platformId: "trackgeek", support: "yes" },
  { criterionId: "anime", platformId: "simkl", support: "yes" },
  { criterionId: "anime", platformId: "anilist", support: "yes" },
  { criterionId: "anime", platformId: "mylists", support: "yes" },

  { criterionId: "manga", platformId: "trackgeek", support: "yes" },
  { criterionId: "manga", platformId: "anilist", support: "yes" },

  { criterionId: "books", platformId: "trackgeek", support: "yes" },
  { criterionId: "books", platformId: "mylists", support: "yes" },
  { criterionId: "books", platformId: "storygraph", support: "yes" },

  { criterionId: "games", platformId: "trackgeek", support: "yes" },
  { criterionId: "games", platformId: "backloggd", support: "yes" },
  { criterionId: "games", platformId: "mylists", support: "yes" },

  { criterionId: "movies", platformId: "trackgeek", support: "yes" },
  { criterionId: "movies", platformId: "simkl", support: "yes" },
  { criterionId: "movies", platformId: "mylists", support: "yes" },

  { criterionId: "series", platformId: "trackgeek", support: "yes" },
  { criterionId: "series", platformId: "simkl", support: "yes" },
  { criterionId: "series", platformId: "mylists", support: "yes" },

  { criterionId: "granular-progress", platformId: "trackgeek", support: "yes" },
  { criterionId: "granular-progress", platformId: "simkl", support: "yes" },
  { criterionId: "granular-progress", platformId: "anilist", support: "yes" },
  { criterionId: "granular-progress", platformId: "mylists", support: "yes" },
  {
    criterionId: "granular-progress",
    platformId: "storygraph",
    support: "partial",
    note: "pages:compare.notes.storygraphBooksOnly",
  },

  { criterionId: "reviews", platformId: "trackgeek", support: "yes" },
  { criterionId: "reviews", platformId: "simkl", support: "yes" },
  { criterionId: "reviews", platformId: "anilist", support: "yes" },
  { criterionId: "reviews", platformId: "backloggd", support: "yes" },
  {
    criterionId: "reviews",
    platformId: "mylists",
    support: "partial",
    note: "pages:compare.notes.mylistsCommentsOnly",
  },
  { criterionId: "reviews", platformId: "storygraph", support: "yes" },

  { criterionId: "custom-lists", platformId: "trackgeek", support: "yes" },
  { criterionId: "custom-lists", platformId: "simkl", support: "yes" },
  { criterionId: "custom-lists", platformId: "anilist", support: "yes" },
  { criterionId: "custom-lists", platformId: "backloggd", support: "yes" },
  { criterionId: "custom-lists", platformId: "mylists", support: "yes" },
  { criterionId: "custom-lists", platformId: "storygraph", support: "yes" },

  { criterionId: "public-profile", platformId: "trackgeek", support: "yes" },
  { criterionId: "public-profile", platformId: "simkl", support: "yes" },
  { criterionId: "public-profile", platformId: "anilist", support: "yes" },
  { criterionId: "public-profile", platformId: "backloggd", support: "yes" },
  { criterionId: "public-profile", platformId: "mylists", support: "yes" },
  { criterionId: "public-profile", platformId: "storygraph", support: "yes" },

  { criterionId: "public-api", platformId: "trackgeek", support: "yes" },
  { criterionId: "public-api", platformId: "simkl", support: "yes" },
  { criterionId: "public-api", platformId: "anilist", support: "yes" },
  { criterionId: "public-api", platformId: "mylists", support: "no" },
  {
    criterionId: "public-api",
    platformId: "storygraph",
    support: "partial",
    note: "pages:compare.notes.storygraphPartnerIntegrations",
  },

  { criterionId: "feed", platformId: "trackgeek", support: "yes" },
  { criterionId: "feed", platformId: "anilist", support: "yes" },
  { criterionId: "feed", platformId: "backloggd", support: "yes" },
  { criterionId: "feed", platformId: "mylists", support: "yes" },
  { criterionId: "feed", platformId: "storygraph", support: "yes" },

  { criterionId: "mobile", platformId: "simkl", support: "yes" },
  {
    criterionId: "mobile",
    platformId: "anilist",
    support: "partial",
    note: "pages:compare.notes.anilistCommunityApps",
  },
  { criterionId: "mobile", platformId: "storygraph", support: "yes" },

  { criterionId: "import-export", platformId: "trackgeek", support: "yes" },
  { criterionId: "import-export", platformId: "simkl", support: "yes" },
  { criterionId: "import-export", platformId: "anilist", support: "yes" },
  {
    criterionId: "import-export",
    platformId: "backloggd",
    support: "partial",
    note: "pages:compare.notes.backloggdLimitedExport",
  },
  { criterionId: "import-export", platformId: "storygraph", support: "yes" },
];

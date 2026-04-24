export type ComparisonSupport = "yes" | "no" | "partial";

export interface ComparisonPlatform {
  id: string;
  name: string;
  shortDescription: string;
  isTrackGeek?: boolean;
}

export interface ComparisonCriterion {
  id: string;
  label: string;
  description: string;
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
    shortDescription: "All media, one profile",
    isTrackGeek: true,
  },
  {
    id: "simkl",
    name: "Simkl",
    shortDescription: "Movies, TV and anime",
  },
  {
    id: "anilist",
    name: "AniList",
    shortDescription: "Anime and manga focus",
  },
  {
    id: "backloggd",
    name: "Backloggd",
    shortDescription: "Games catalog and logs",
  },
  {
    id: "mylists",
    name: "MyLists",
    shortDescription: "Community media lists",
  },
  {
    id: "storygraph",
    name: "StoryGraph",
    shortDescription: "Book tracking and stats",
  },
];

export const comparisonCriteria: ComparisonCriterion[] = [
  { id: "anime", label: "Anime", description: "Track seasons, status and progress." },
  { id: "manga", label: "Manga", description: "Track chapters and reading status." },
  { id: "books", label: "Books", description: "Track books and reading goals." },
  { id: "games", label: "Games", description: "Track backlog, completion and ratings." },
  { id: "movies", label: "Movies", description: "Track watchlist and watched history." },
  { id: "series", label: "Series", description: "Track TV episodes and seasons." },
  {
    id: "episode-progress",
    label: "Episode progress",
    description: "Granular progress per episode/chapter/entry.",
  },
  { id: "reviews", label: "Reviews", description: "User-written reviews and scores." },
  { id: "custom-lists", label: "Custom lists", description: "Create public or private custom lists." },
  { id: "public-profile", label: "Public profile", description: "Share profile with other users." },
  { id: "public-api", label: "Public API", description: "Developer-facing public API." },
  { id: "feed", label: "Social feed", description: "Follow activity from friends/community." },
  { id: "mobile", label: "Mobile (PWA/App)", description: "Dedicated mobile experience." },
  { id: "import-export", label: "Import / Export", description: "Move data in and out of platform." },
];

export const comparisonEntries: ComparisonEntry[] = [
  { criterionId: "anime", platformId: "trackgeek", support: "yes" },
  { criterionId: "anime", platformId: "simkl", support: "yes" },
  { criterionId: "anime", platformId: "anilist", support: "yes" },
  { criterionId: "anime", platformId: "backloggd", support: "no" },
  { criterionId: "anime", platformId: "mylists", support: "partial", note: "Community lists can include anime." },
  { criterionId: "anime", platformId: "storygraph", support: "no" },

  { criterionId: "manga", platformId: "trackgeek", support: "yes" },
  { criterionId: "manga", platformId: "simkl", support: "no" },
  { criterionId: "manga", platformId: "anilist", support: "yes" },
  { criterionId: "manga", platformId: "backloggd", support: "no" },
  { criterionId: "manga", platformId: "mylists", support: "partial", note: "Possible via user-generated lists." },
  { criterionId: "manga", platformId: "storygraph", support: "no" },

  { criterionId: "books", platformId: "trackgeek", support: "yes" },
  { criterionId: "books", platformId: "simkl", support: "no" },
  { criterionId: "books", platformId: "anilist", support: "no" },
  { criterionId: "books", platformId: "backloggd", support: "no" },
  { criterionId: "books", platformId: "mylists", support: "partial", note: "Books can be added to custom lists." },
  { criterionId: "books", platformId: "storygraph", support: "yes" },

  { criterionId: "games", platformId: "trackgeek", support: "yes" },
  { criterionId: "games", platformId: "simkl", support: "no" },
  { criterionId: "games", platformId: "anilist", support: "no" },
  { criterionId: "games", platformId: "backloggd", support: "yes" },
  { criterionId: "games", platformId: "mylists", support: "partial", note: "List-based tracking only." },
  { criterionId: "games", platformId: "storygraph", support: "no" },

  { criterionId: "movies", platformId: "trackgeek", support: "yes" },
  { criterionId: "movies", platformId: "simkl", support: "yes" },
  { criterionId: "movies", platformId: "anilist", support: "no" },
  { criterionId: "movies", platformId: "backloggd", support: "no" },
  { criterionId: "movies", platformId: "mylists", support: "partial", note: "Movies supported via custom lists." },
  { criterionId: "movies", platformId: "storygraph", support: "no" },

  { criterionId: "series", platformId: "trackgeek", support: "yes" },
  { criterionId: "series", platformId: "simkl", support: "yes" },
  { criterionId: "series", platformId: "anilist", support: "no" },
  { criterionId: "series", platformId: "backloggd", support: "no" },
  { criterionId: "series", platformId: "mylists", support: "partial", note: "TV shows supported via custom lists." },
  { criterionId: "series", platformId: "storygraph", support: "no" },

  { criterionId: "episode-progress", platformId: "trackgeek", support: "yes" },
  { criterionId: "episode-progress", platformId: "simkl", support: "yes" },
  { criterionId: "episode-progress", platformId: "anilist", support: "yes" },
  { criterionId: "episode-progress", platformId: "backloggd", support: "no" },
  { criterionId: "episode-progress", platformId: "mylists", support: "no" },
  { criterionId: "episode-progress", platformId: "storygraph", support: "partial", note: "Reading progress for books only." },

  { criterionId: "reviews", platformId: "trackgeek", support: "yes" },
  { criterionId: "reviews", platformId: "simkl", support: "yes" },
  { criterionId: "reviews", platformId: "anilist", support: "yes" },
  { criterionId: "reviews", platformId: "backloggd", support: "yes" },
  { criterionId: "reviews", platformId: "mylists", support: "partial", note: "Comments on lists instead of full reviews." },
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
  { criterionId: "public-api", platformId: "backloggd", support: "no" },
  { criterionId: "public-api", platformId: "mylists", support: "no" },
  { criterionId: "public-api", platformId: "storygraph", support: "partial", note: "Limited integrations for partner apps." },

  { criterionId: "feed", platformId: "trackgeek", support: "yes" },
  { criterionId: "feed", platformId: "simkl", support: "yes" },
  { criterionId: "feed", platformId: "anilist", support: "yes" },
  { criterionId: "feed", platformId: "backloggd", support: "yes" },
  { criterionId: "feed", platformId: "mylists", support: "partial", note: "Updates from followed lists only." },
  { criterionId: "feed", platformId: "storygraph", support: "yes" },

  { criterionId: "mobile", platformId: "trackgeek", support: "yes", note: "Installable PWA with mobile-first UI." },
  { criterionId: "mobile", platformId: "simkl", support: "yes" },
  { criterionId: "mobile", platformId: "anilist", support: "partial", note: "No official app; community apps available." },
  { criterionId: "mobile", platformId: "backloggd", support: "partial", note: "Responsive web, no dedicated app." },
  { criterionId: "mobile", platformId: "mylists", support: "partial", note: "Responsive web support." },
  { criterionId: "mobile", platformId: "storygraph", support: "yes" },

  { criterionId: "import-export", platformId: "trackgeek", support: "yes" },
  { criterionId: "import-export", platformId: "simkl", support: "yes" },
  { criterionId: "import-export", platformId: "anilist", support: "yes" },
  { criterionId: "import-export", platformId: "backloggd", support: "partial", note: "Import available; export is limited." },
  { criterionId: "import-export", platformId: "mylists", support: "partial", note: "Basic list export formats only." },
  { criterionId: "import-export", platformId: "storygraph", support: "yes" },
];

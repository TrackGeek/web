import { useInfiniteQuery } from "@tanstack/react-query";
import type { FavoriteItem } from "@/components/pages/user/overview-tab/favorite-card";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const ITEMS_PER_PAGE = 200;

type ProgressStatsKey = keyof ApiTypes.User["progressStats"];

interface ProgressContentConfig {
  endpoint: string;
  responseKey: keyof ApiTypes.GetProgressResponse;
  /** Key into `progressStats` (note: content type "tv" maps to stats key "tvShow"). */
  statsKey: ProgressStatsKey;
  /** Active-progress status for this content type. */
  activeStatus: ApiTypes.ProgressStatus;
  /** `progressStats` sub-key + `feed:lists.*` i18n key for the active status. */
  activeStatsKey: "watching" | "playing" | "reading" | "planning";
}

export const PROGRESS_CONTENT: Record<ApiTypes.ReviewContentType, ProgressContentConfig> = {
  anime: {
    endpoint: apiEndpoints.animeProgress,
    responseKey: "animeProgresses",
    statsKey: "anime",
    activeStatus: "Watching",
    activeStatsKey: "watching",
  },
  manga: {
    endpoint: apiEndpoints.mangaProgress,
    responseKey: "mangaProgresses",
    statsKey: "manga",
    activeStatus: "Reading",
    activeStatsKey: "reading",
  },
  tv: {
    endpoint: apiEndpoints.tvShowProgress,
    responseKey: "tvShowProgresses",
    statsKey: "tvShow",
    activeStatus: "Watching",
    activeStatsKey: "watching",
  },
  movie: {
    endpoint: apiEndpoints.movieProgress,
    responseKey: "movieProgresses",
    statsKey: "movie",
    activeStatus: "Planning",
    activeStatsKey: "planning",
  },
  game: {
    endpoint: apiEndpoints.gameProgress,
    responseKey: "gameProgresses",
    statsKey: "game",
    activeStatus: "Playing",
    activeStatsKey: "playing",
  },
  book: {
    endpoint: apiEndpoints.bookProgress,
    responseKey: "bookProgresses",
    statsKey: "book",
    activeStatus: "Reading",
    activeStatsKey: "reading",
  },
};

export interface ProgressStatusSection {
  /** `ProgressStatus` value used to bucket the loaded rows. */
  status: ApiTypes.ProgressStatus;
  /** Key into `progressStats[type]` for the accurate total count. */
  statsKey: string;
  /** `feed:lists.*` i18n key for the section heading. */
  labelKey: string;
}

/** Ordered status sections for a content type: active first, then paused/dropped/completed/planning. */
export function progressStatusSections(contentType: ApiTypes.ReviewContentType): ProgressStatusSection[] {
  const { activeStatus, activeStatsKey } = PROGRESS_CONTENT[contentType];

  return [
    { status: activeStatus, statsKey: activeStatsKey, labelKey: `feed:lists.${activeStatsKey}` },
    ...(activeStatus !== "Planning"
      ? [{ status: "Planning" as const, statsKey: "planning", labelKey: "feed:lists.planning" }]
      : []),
    { status: "Completed" as const, statsKey: "completed", labelKey: "feed:lists.completed" },
    { status: "Paused" as const, statsKey: "paused", labelKey: "feed:lists.paused" },
    { status: "Dropped" as const, statsKey: "dropped", labelKey: "feed:lists.dropped" },
  ];
}

/** Maps a progress row to a `FavoriteItem` so it can render with `FavoriteCard`. */
export function progressToItem(contentType: ApiTypes.ReviewContentType, row: ApiTypes.Progress): FavoriteItem | null {
  switch (contentType) {
    case "anime":
      if (!row.anime) return null;
      return {
        id: row.id,
        title: row.anime.title,
        image: row.anime.imageUrl ?? "",
        contentType: "anime",
        slug: String(row.anime.malId),
        mediaId: row.anime.id,
      };
    case "manga":
      if (!row.manga) return null;
      return {
        id: row.id,
        title: row.manga.title,
        image: row.manga.imageUrl ?? "",
        contentType: "manga",
        slug: String(row.manga.malId),
        mediaId: row.manga.id,
      };
    case "tv":
      if (!row.tvShow) return null;
      return {
        id: row.id,
        title: row.tvShow.name,
        image: row.tvShow.posterUrl ?? "",
        contentType: "tv",
        slug: String(row.tvShow.tmdbId),
        mediaId: row.tvShow.id,
      };
    case "movie":
      if (!row.movie) return null;
      return {
        id: row.id,
        title: row.movie.title,
        image: row.movie.posterUrl ?? "",
        contentType: "movie",
        slug: String(row.movie.tmdbId),
        mediaId: row.movie.id,
      };
    case "game":
      if (!row.game) return null;
      return {
        id: row.id,
        title: row.game.name,
        image: row.game.coverUrl ?? "",
        contentType: "game",
        slug: String(row.game.igdbId),
        mediaId: row.game.id,
      };
    case "book":
      if (!row.book) return null;
      return {
        id: row.id,
        title: row.book.title,
        image: row.book.imageUrl ?? "",
        contentType: "book",
        slug: String(row.book.hardcoverId),
        mediaId: row.book.id,
      };
    default:
      return null;
  }
}

export function userProgressQueryKey(contentType: ApiTypes.ReviewContentType, userId: string) {
  return ["user-progress", contentType, userId];
}

export function useUserProgress(contentType: ApiTypes.ReviewContentType, userId: string) {
  const config = PROGRESS_CONTENT[contentType];

  return useInfiniteQuery({
    queryKey: userProgressQueryKey(contentType, userId),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetProgressResponse>(`${config.endpoint}/`, {
          params: { userId, page: pageParam, itemsPerPage: ITEMS_PER_PAGE },
        })
        .then(({ data }) => data[config.responseKey] as ApiTypes.PaginatedResponse<ApiTypes.Progress>),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
  });
}

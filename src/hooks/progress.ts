import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { FavoriteItem } from "@/components/pages/user/overview-tab/favorite-card";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const ITEMS_PER_PAGE = 50;

interface ProgressContentConfig {
  endpoint: string;
  responseKey: keyof Omit<ApiTypes.GetProgressResponse, "statusCounts">;
  activeStatus: ApiTypes.ProgressStatus;
  activeLabelKey: "watching" | "playing" | "reading" | "planning";
  repeatStatus?: ApiTypes.ProgressStatus;
  repeatLabelKey?: "rewatching" | "replaying" | "rereading";
}

export const PROGRESS_CONTENT: Record<ApiTypes.ReviewContentType, ProgressContentConfig> = {
  anime: {
    endpoint: apiEndpoints.animeProgress,
    responseKey: "animeProgresses",
    activeStatus: "Watching",
    activeLabelKey: "watching",
    repeatStatus: "Rewatching",
    repeatLabelKey: "rewatching",
  },
  manga: {
    endpoint: apiEndpoints.mangaProgress,
    responseKey: "mangaProgresses",
    activeStatus: "Reading",
    activeLabelKey: "reading",
    repeatStatus: "Rereading",
    repeatLabelKey: "rereading",
  },
  tv: {
    endpoint: apiEndpoints.tvShowProgress,
    responseKey: "tvShowProgresses",
    activeStatus: "Watching",
    activeLabelKey: "watching",
    repeatStatus: "Rewatching",
    repeatLabelKey: "rewatching",
  },
  movie: {
    endpoint: apiEndpoints.movieProgress,
    responseKey: "movieProgresses",
    activeStatus: "Planning",
    activeLabelKey: "planning",
  },
  game: {
    endpoint: apiEndpoints.gameProgress,
    responseKey: "gameProgresses",
    activeStatus: "Playing",
    activeLabelKey: "playing",
    repeatStatus: "Replaying",
    repeatLabelKey: "replaying",
  },
  book: {
    endpoint: apiEndpoints.bookProgress,
    responseKey: "bookProgresses",
    activeStatus: "Reading",
    activeLabelKey: "reading",
    repeatStatus: "Rereading",
    repeatLabelKey: "rereading",
  },
};

export interface ProgressStatusSection {
  status: ApiTypes.ProgressStatus;
  labelKey: string;
}

export function progressStatusSections(contentType: ApiTypes.ReviewContentType): ProgressStatusSection[] {
  const { activeStatus, activeLabelKey, repeatStatus, repeatLabelKey } = PROGRESS_CONTENT[contentType];

  return [
    { status: activeStatus, labelKey: `feed:lists.${activeLabelKey}` },
    ...(repeatStatus && repeatLabelKey ? [{ status: repeatStatus, labelKey: `feed:lists.${repeatLabelKey}` }] : []),
    ...(activeStatus !== "Planning" ? [{ status: "Planning" as const, labelKey: "feed:lists.planning" }] : []),
    { status: "Completed" as const, labelKey: "feed:lists.completed" },
    { status: "Paused" as const, labelKey: "feed:lists.paused" },
    { status: "Dropped" as const, labelKey: "feed:lists.dropped" },
  ];
}

export interface ProgressItem extends FavoriteItem {
  completion?: ApiTypes.GameCompletion | null;
  hoursPlayed?: number | null;
}

export function progressToItem(contentType: ApiTypes.ReviewContentType, row: ApiTypes.Progress): ProgressItem | null {
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
        slug: String(row.manga.anilistId ?? row.manga.malId),
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
        completion: row.completion ?? null,
        hoursPlayed: row.hoursPlayed ?? null,
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

const FULL_YEAR = /^\d{4}$/;

export interface ProgressFilters {
  genres: string[];
  year: string;
  released: boolean | null;
  releaseStates: ApiTypes.MediaReleaseState[];
  search: string;
}

export const EMPTY_PROGRESS_FILTERS: ProgressFilters = {
  genres: [],
  year: "",
  released: null,
  releaseStates: [],
  search: "",
};

export interface ProgressSort {
  by: ApiTypes.ProgressSortBy;
  order: ApiTypes.ProgressSortOrder;
}

export const DEFAULT_PROGRESS_SORT: ProgressSort = { by: "addedAt", order: "desc" };

const SORT_LABEL_KEYS: Record<ApiTypes.ProgressSortBy, string> = {
  name: "user:sort.title",
  addedAt: "user:sort.lastAdded",
  updatedAt: "user:sort.lastUpdated",
  releaseDate: "common:releaseDate",
};

export function progressSortOptions(contentType: ApiTypes.ReviewContentType) {
  const fields = Object.keys(SORT_LABEL_KEYS) as ApiTypes.ProgressSortBy[];

  return fields
    .filter((field) => field !== "releaseDate" || contentType !== "manga")
    .map((field) => ({ value: field, labelKey: SORT_LABEL_KEYS[field] }));
}

export function isYearApplied(year: string) {
  return FULL_YEAR.test(year.trim());
}

export function countActiveFilters(filters: ProgressFilters) {
  return (
    (filters.genres.length > 0 ? 1 : 0) +
    (isYearApplied(filters.year) ? 1 : 0) +
    (filters.released !== null ? 1 : 0) +
    (filters.releaseStates.length > 0 ? 1 : 0)
  );
}

function toQueryParams(filters: ProgressFilters, sort?: ProgressSort) {
  const search = filters.search.trim();

  return {
    ...(filters.genres.length > 0 && { genres: filters.genres.join(",") }),
    ...(isYearApplied(filters.year) && { year: Number(filters.year.trim()) }),
    ...(filters.released !== null && { released: filters.released }),
    ...(filters.releaseStates.length > 0 && { releaseStates: filters.releaseStates.join(",") }),
    ...(search && { search }),
    ...(sort && { sortBy: sort.by, sortOrder: sort.order }),
  };
}

interface ProgressPage {
  page: ApiTypes.PaginatedResponse<ApiTypes.Progress>;
  statusCounts: ApiTypes.ProgressStatusCounts;
}

function fetchProgressPage(
  contentType: ApiTypes.ReviewContentType,
  params: Record<string, unknown>,
): Promise<ProgressPage> {
  const config = PROGRESS_CONTENT[contentType];

  return api.get<ApiTypes.GetProgressResponse>(`${config.endpoint}/`, { params }).then(({ data }) => ({
    page: data[config.responseKey] as ApiTypes.PaginatedResponse<ApiTypes.Progress>,
    statusCounts: data.statusCounts,
  }));
}

export function userProgressQueryKey(
  contentType: ApiTypes.ReviewContentType,
  userId: string,
  status?: ApiTypes.ProgressStatus,
  filters?: ProgressFilters,
  sort?: ProgressSort,
) {
  return ["user-progress", contentType, userId, status, filters && toQueryParams(filters, sort)];
}

export function useUserProgress(
  contentType: ApiTypes.ReviewContentType,
  userId: string,
  status: ApiTypes.ProgressStatus,
  filters: ProgressFilters,
  sort: ProgressSort,
) {
  return useInfiniteQuery({
    queryKey: userProgressQueryKey(contentType, userId, status, filters, sort),
    queryFn: ({ pageParam }) =>
      fetchProgressPage(contentType, {
        userId,
        status,
        ...toQueryParams(filters, sort),
        page: pageParam,
        itemsPerPage: ITEMS_PER_PAGE,
      }),
    initialPageParam: 1,
    getNextPageParam: ({ page }) => (page.inPage < page.pages ? page.inPage + 1 : undefined),
    placeholderData: keepPreviousData,
  });
}

export function useActiveProgress(contentType: ApiTypes.ReviewContentType, userId: string, limit: number) {
  const { activeStatus } = PROGRESS_CONTENT[contentType];

  return useQuery({
    queryKey: ["active-progress", contentType, userId, activeStatus, limit],
    queryFn: () =>
      fetchProgressPage(contentType, {
        userId,
        status: activeStatus,
        sortBy: "updatedAt",
        sortOrder: "desc",
        page: 1,
        itemsPerPage: limit,
      }),
    enabled: Boolean(userId),
    select: ({ page }: ProgressPage) => page.items.flatMap((row) => progressToItem(contentType, row) ?? []),
  });
}

export function useProgressFilterOptions(contentType: ApiTypes.ReviewContentType, userId: string) {
  return useQuery({
    queryKey: ["user-progress-filters", contentType, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetProgressFiltersResponse>(`${PROGRESS_CONTENT[contentType].endpoint}/filters`, {
          params: { userId },
        })
        .then(({ data }) => data.filters),
  });
}

export async function fetchRandomProgress(
  contentType: ApiTypes.ReviewContentType,
  userId: string,
  status: ApiTypes.ProgressStatus,
  filters: ProgressFilters,
): Promise<ProgressItem | null> {
  const params = { userId, status, ...toQueryParams(filters), itemsPerPage: 1 };
  const { page } = await fetchProgressPage(contentType, { ...params, page: 1 });

  if (page.total === 0) return null;

  const { page: randomPage } = await fetchProgressPage(contentType, {
    ...params,
    page: Math.floor(Math.random() * page.total) + 1,
  });

  const row = randomPage.items[0];

  return row ? progressToItem(contentType, row) : null;
}

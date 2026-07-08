import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const ITEMS_PER_PAGE = 10;

export interface ReviewCriterion {
  /** Backend field name sent in the update payload. */
  field: string;
  /** i18n key (under feed:criteries) for the label. */
  labelKey: string;
}

export interface ReviewContentConfig {
  endpoint: string;
  responseKey: keyof ApiTypes.GetReviewsResponse;
  mediaKey: "tvShow" | "movie" | "game" | "anime" | "book" | "manga";
  routeName: string;
  entityId: string;
  reactionType: string;
  reactionIdField: string;
  /** Whether this content type has a free-text `story` field (vs a numeric criterion). */
  hasStory: boolean;
  criteria: ReviewCriterion[];
  mapCriteries: (review: ApiTypes.Review) => Record<string, number | undefined>;
}

const num = (value: unknown): number | undefined => (value === null || value === undefined ? undefined : Number(value));

export const REVIEW_CONTENT: Record<ApiTypes.ReviewContentType, ReviewContentConfig> = {
  tv: {
    endpoint: apiEndpoints.tvShowReview,
    responseKey: "tvShowReviews",
    mediaKey: "tvShow",
    entityId: "tmdbId",
    routeName: "/tv",
    reactionType: "TvShowReview",
    reactionIdField: "tvShowReviewId",
    hasStory: true,
    criteria: [
      { field: "direction", labelKey: "direction" },
      { field: "production", labelKey: "production" },
      { field: "acting", labelKey: "acting" },
    ],
    mapCriteries: (r) => ({
      all: num(r.overall),
      direction: num(r.direction),
      production: num(r.production),
      acting: num(r.acting),
    }),
  },
  movie: {
    endpoint: apiEndpoints.movieReview,
    responseKey: "movieReviews",
    mediaKey: "movie",
    routeName: "/movie",
    entityId: "tmdbId",
    reactionType: "MovieReview",
    reactionIdField: "movieReviewId",
    hasStory: true,
    criteria: [
      { field: "direction", labelKey: "direction" },
      { field: "production", labelKey: "production" },
      { field: "acting", labelKey: "acting" },
    ],
    mapCriteries: (r) => ({
      all: num(r.overall),
      direction: num(r.direction),
      production: num(r.production),
      acting: num(r.acting),
    }),
  },
  game: {
    endpoint: apiEndpoints.gameReview,
    responseKey: "gameReviews",
    mediaKey: "game",
    routeName: "/game",
    entityId: "igdbId",
    reactionType: "GameReview",
    reactionIdField: "gameReviewId",
    hasStory: false,
    criteria: [
      { field: "graphics", labelKey: "graphics" },
      { field: "sound", labelKey: "soundtrack" },
      { field: "story", labelKey: "story" },
      { field: "gameplay", labelKey: "gameplay" },
    ],
    mapCriteries: (r) => ({
      all: num(r.overall),
      graphics: num(r.graphics),
      soundtrack: num(r.sound),
      story: num(r.story),
      gameplay: num(r.gameplay),
    }),
  },
  anime: {
    endpoint: apiEndpoints.animeReview,
    responseKey: "animeReviews",
    mediaKey: "anime",
    routeName: "/anime",
    entityId: "malId",
    reactionType: "AnimeReview",
    reactionIdField: "animeReviewId",
    hasStory: false,
    criteria: [
      { field: "story", labelKey: "story" },
      { field: "characters", labelKey: "characters" },
      { field: "animation", labelKey: "animation" },
      { field: "sound", labelKey: "soundtrack" },
    ],
    mapCriteries: (r) => ({
      all: num(r.overall),
      story: num(r.story),
      characters: num(r.characters),
      animation: num(r.animation),
      soundtrack: num(r.sound),
    }),
  },
  book: {
    endpoint: apiEndpoints.bookReview,
    responseKey: "bookReviews",
    mediaKey: "book",
    routeName: "/book",
    entityId: "hardcoverId",
    reactionType: "BookReview",
    reactionIdField: "bookReviewId",
    hasStory: false,
    criteria: [
      { field: "characters", labelKey: "characters" },
      { field: "language", labelKey: "language" },
      { field: "theme", labelKey: "theme" },
    ],
    mapCriteries: (r) => ({
      all: num(r.overall),
      characters: num(r.characters),
      language: num(r.language),
      theme: num(r.theme),
    }),
  },
  manga: {
    endpoint: apiEndpoints.mangaReview,
    responseKey: "mangaReviews",
    mediaKey: "manga",
    routeName: "/manga",
    entityId: "malId",
    reactionType: "MangaReview",
    reactionIdField: "mangaReviewId",
    hasStory: true,
    criteria: [
      { field: "art", labelKey: "art" },
      { field: "worldbuilding", labelKey: "worldbuilding" },
    ],
    mapCriteries: (r) => ({
      all: num(r.overall),
      art: num(r.art),
      worldbuilding: num(r.worldbuilding),
    }),
  },
};

export function reviewMediaTitle(contentType: ApiTypes.ReviewContentType, review: ApiTypes.Review): string {
  const media = review[REVIEW_CONTENT[contentType].mediaKey];
  return media?.title ?? media?.name ?? "";
}

export function reviewMediaImage(contentType: ApiTypes.ReviewContentType, review: ApiTypes.Review): string {
  const media = review[REVIEW_CONTENT[contentType].mediaKey];
  return media?.coverUrl ?? media?.backdropUrl ?? media?.imageUrl ?? "";
}

export function userReviewsQueryKey(contentType: ApiTypes.ReviewContentType, userId: string) {
  return ["user-reviews", contentType, userId];
}

export function useUserReviews(contentType: ApiTypes.ReviewContentType, userId: string, query?: string) {
  const config = REVIEW_CONTENT[contentType];
  const trimmedQuery = query?.trim() || undefined;

  return useInfiniteQuery({
    queryKey: [...userReviewsQueryKey(contentType, userId), trimmedQuery],
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetReviewsResponse>(`${config.endpoint}/`, {
          params: {
            userId,
            page: pageParam,
            itemsPerPage: ITEMS_PER_PAGE,
            ...(trimmedQuery && { query: trimmedQuery }),
          },
        })
        .then(({ data }) => data[config.responseKey] as ApiTypes.PaginatedResponse<ApiTypes.Review>),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
  });
}

export function useDeleteReview(contentType: ApiTypes.ReviewContentType, userId: string) {
  const queryClient = useQueryClient();
  const config = REVIEW_CONTENT[contentType];

  return useMutation({
    mutationFn: (reviewId: string) => api.delete(`${config.endpoint}/${reviewId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userReviewsQueryKey(contentType, userId) }),
  });
}

export function useUpdateReview(contentType: ApiTypes.ReviewContentType, userId: string) {
  const queryClient = useQueryClient();
  const config = REVIEW_CONTENT[contentType];

  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: Record<string, unknown> }) =>
      api.patch(`${config.endpoint}/${reviewId}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userReviewsQueryKey(contentType, userId) }),
  });
}

interface ToggleReactionArgs {
  reviewId: string;
  /** The current user's existing reaction on this review, if any. */
  currentReaction?: ApiTypes.ReviewReaction;
  emoji: string;
}

/**
 * Toggles the current user's emoji reaction on a review. One reaction per user
 * (DB unique constraint): clicking the same emoji removes it, a different emoji
 * replaces it (delete old, then create new).
 */
export function useToggleReviewReaction(contentType: ApiTypes.ReviewContentType, userId: string) {
  const queryClient = useQueryClient();
  const config = REVIEW_CONTENT[contentType];

  return useMutation({
    mutationFn: async ({ reviewId, currentReaction, emoji }: ToggleReactionArgs) => {
      if (currentReaction) {
        await api.delete(apiEndpoints.deleteReaction(currentReaction.id));
        if (currentReaction.emoji === emoji) return;
      }

      await api.post(apiEndpoints.addReaction, {
        type: config.reactionType,
        emoji,
        [config.reactionIdField]: reviewId,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userReviewsQueryKey(contentType, userId) }),
  });
}

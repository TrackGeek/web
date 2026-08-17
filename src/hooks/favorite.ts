import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ContentType } from "@/components/layouts/filters.tsx";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const ITEMS_PER_PAGE = 18;

export type FavoriteTarget = ContentType | "person";

const FAVORITE_TYPE_BY_CONTENT: Record<FavoriteTarget, ApiTypes.FavoriteType> = {
  anime: "Anime",
  manga: "Manga",
  tv: "TVShow",
  movie: "Movie",
  game: "Game",
  book: "Book",
  person: "Person",
};

const FAVORITE_ID_FIELD_BY_CONTENT: Record<FavoriteTarget, keyof ApiTypes.FavoriteRequest> = {
  anime: "animeId",
  manga: "mangaId",
  tv: "tvShowId",
  movie: "movieId",
  game: "gameId",
  book: "bookId",
  person: "personId",
};

export function buildFavoriteRequest(mediaType: FavoriteTarget, id: string): ApiTypes.FavoriteRequest {
  return {
    type: FAVORITE_TYPE_BY_CONTENT[mediaType],
    [FAVORITE_ID_FIELD_BY_CONTENT[mediaType]]: id,
  };
}

export function favoritesQueryKey(userId: string) {
  return ["favorites", userId];
}

export function useFavorites(userId: string, query?: string) {
  const trimmedQuery = query?.trim() || undefined;

  return useInfiniteQuery({
    queryKey: [...favoritesQueryKey(userId), trimmedQuery],
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetFavoritesByUserIdResponse>(apiEndpoints.getFavoritesByUserId(userId), {
          params: { page: pageParam, itemsPerPage: ITEMS_PER_PAGE, ...(trimmedQuery && { query: trimmedQuery }) },
        })
        .then(({ data }) => data.favorites),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
  });
}

export function favoriteStatusQueryKey(target: FavoriteTarget, id: string) {
  return ["favoriteStatus", target, id];
}

export function useFavoriteStatus(target: FavoriteTarget, id: string, enabled: boolean) {
  return useQuery({
    queryKey: favoriteStatusQueryKey(target, id),
    queryFn: () =>
      api
        .get<ApiTypes.GetFavoriteStatusResponse>(apiEndpoints.getFavoriteStatus, {
          params: buildFavoriteRequest(target, id),
        })
        .then(({ data }) => data.favorited),
    enabled: enabled && !!id,
  });
}

export function useToggleFavorite(mediaType: FavoriteTarget, id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isFavorited: boolean) => {
      const body = buildFavoriteRequest(mediaType, id);

      return isFavorited
        ? api.delete(apiEndpoints.removeFavorite, { data: body })
        : api.post(apiEndpoints.addFavorite, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteStatus"] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentType, mediaId }: { contentType: FavoriteTarget; mediaId: string }) =>
      api.delete(apiEndpoints.removeFavorite, { data: buildFavoriteRequest(contentType, mediaId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteStatus"] });
    },
  });
}

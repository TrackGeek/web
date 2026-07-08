import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ContentType } from "@/components/layouts/filters.tsx";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const ITEMS_PER_PAGE = 18;

const FAVORITE_TYPE_BY_CONTENT: Record<ContentType, ApiTypes.FavoriteType> = {
  anime: "Anime",
  manga: "Manga",
  tv: "TVShow",
  movie: "Movie",
  game: "Game",
  book: "Book",
};

const FAVORITE_ID_FIELD_BY_CONTENT: Record<ContentType, keyof ApiTypes.FavoriteRequest> = {
  anime: "animeId",
  manga: "mangaId",
  tv: "tvShowId",
  movie: "movieId",
  game: "gameId",
  book: "bookId",
};

export function buildFavoriteRequest(mediaType: ContentType, id: string): ApiTypes.FavoriteRequest {
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

export function useToggleFavorite(mediaType: ContentType, id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isFavorited: boolean) => {
      const body = buildFavoriteRequest(mediaType, id);

      return isFavorited
        ? api.delete(apiEndpoints.removeFavorite, { data: body })
        : api.post(apiEndpoints.addFavorite, body);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contentType, mediaId }: { contentType: ContentType; mediaId: string }) =>
      api.delete(apiEndpoints.removeFavorite, { data: buildFavoriteRequest(contentType, mediaId) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

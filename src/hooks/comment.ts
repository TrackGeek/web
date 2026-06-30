import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

export interface CommentTarget {
  type: ApiTypes.CommentType;
  animeId?: string;
  mangaId?: string;
  tvShowId?: string;
  movieId?: string;
  gameId?: string;
  bookId?: string;
  profileId?: string;
}

const ITEMS_PER_PAGE = 10;

export function commentsQueryKey(target: CommentTarget) {
  return [
    "comments",
    target.type,
    target.animeId,
    target.mangaId,
    target.tvShowId,
    target.movieId,
    target.gameId,
    target.bookId,
    target.profileId,
  ];
}

export function useComments(target: CommentTarget) {
  return useInfiniteQuery({
    queryKey: commentsQueryKey(target),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetCommentsResponse>(apiEndpoints.getComments, {
          params: { ...target, page: pageParam, itemsPerPage: ITEMS_PER_PAGE },
        })
        .then(({ data }) => data.comments),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
  });
}

export function useAddComment(target: CommentTarget) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => api.post(apiEndpoints.addComment, { ...target, content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentsQueryKey(target) }),
  });
}

export function useDeleteComment(target: CommentTarget) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => api.delete(apiEndpoints.deleteComment(commentId)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentsQueryKey(target) }),
  });
}

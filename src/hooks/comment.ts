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

export interface AddCommentInput {
  content: string;
  isSpoiler?: boolean;
  parentId?: string;
}

export function useAddComment(target: CommentTarget) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddCommentInput) => api.post(apiEndpoints.addComment, { ...target, ...input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentsQueryKey(target) }),
  });
}

export interface ToggleCommentReactionArgs {
  commentId: string;
  emoji: string;
  currentReaction?: ApiTypes.CommentReaction;
}

export function useToggleCommentReaction(target: CommentTarget) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, emoji, currentReaction }: ToggleCommentReactionArgs) => {
      if (currentReaction) {
        await api.delete(apiEndpoints.deleteReaction(currentReaction.id));
        if (currentReaction.emoji === emoji) return;
      }

      await api.post(apiEndpoints.addReaction, { type: "Comment", emoji, commentId });
    },
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

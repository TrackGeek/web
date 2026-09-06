import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  followingActivitiesQueryKey,
  globalActivitiesQueryKey,
  trendingActivitiesQueryKey,
  userActivitiesQueryKey,
} from "@/hooks/activity";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

function useInvalidateFeeds(userId?: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: globalActivitiesQueryKey() });
    queryClient.invalidateQueries({ queryKey: followingActivitiesQueryKey() });
    queryClient.invalidateQueries({ queryKey: trendingActivitiesQueryKey() });

    if (userId) {
      queryClient.invalidateQueries({ queryKey: userActivitiesQueryKey(userId) });
    }
  };
}

export function useCreatePost(userId?: string) {
  const invalidateFeeds = useInvalidateFeeds(userId);

  return useMutation({
    mutationFn: (input: ApiTypes.CreatePostRequest) =>
      api.post<ApiTypes.PostResponse>(apiEndpoints.createPost, input).then(({ data }) => data.post),
    onSuccess: invalidateFeeds,
  });
}

export interface UpdatePostArgs extends ApiTypes.UpdatePostRequest {
  postId: string;
}

export function useUpdatePost(userId?: string) {
  const invalidateFeeds = useInvalidateFeeds(userId);

  return useMutation({
    mutationFn: ({ postId, ...input }: UpdatePostArgs) =>
      api.patch<ApiTypes.PostResponse>(apiEndpoints.updatePost(postId), input).then(({ data }) => data.post),
    onSuccess: invalidateFeeds,
  });
}

export function useDeletePost(userId?: string) {
  const invalidateFeeds = useInvalidateFeeds(userId);

  return useMutation({
    mutationFn: (postId: string) => api.delete(apiEndpoints.deletePost(postId)),
    onSuccess: invalidateFeeds,
  });
}

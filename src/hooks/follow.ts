import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth/client";

const ITEMS_PER_PAGE = 18;

export function followersQueryKey(userId: string) {
  return ["followers", userId];
}

export function followingQueryKey(userId: string) {
  return ["following", userId];
}

export function useFollowers(userId: string) {
  return useInfiniteQuery({
    queryKey: followersQueryKey(userId),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetFollowersResponse>(apiEndpoints.getFollowers, {
          params: { userId, page: pageParam, itemsPerPage: ITEMS_PER_PAGE },
        })
        .then(({ data }) => data.followers),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
    enabled: !!userId,
  });
}

export function useFollowing(userId: string) {
  return useInfiniteQuery({
    queryKey: followingQueryKey(userId),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetFollowingResponse>(apiEndpoints.getFollowing, {
          params: { userId, page: pageParam, itemsPerPage: ITEMS_PER_PAGE },
        })
        .then(({ data }) => data.following),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
    enabled: !!userId,
  });
}

export function useFollowStatus(username: string, userId: string) {
  const session = useSession();

  const sessionUser = session.data?.user;
  const isOwnProfile = sessionUser?.id === userId;

  return useQuery({
    queryKey: ["follow-status", username],
    queryFn: () =>
      api
        .get<ApiTypes.GetFollowStatusResponse>(apiEndpoints.getFollowStatus(username))
        .then(({ data }) => data.followStatus),
    enabled: Boolean(sessionUser) && !isOwnProfile,
  });
}

function useFollowMutation(endpoint: (id: string) => string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetId: string) => api.post(endpoint(targetId)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["follow-status"] }),
        queryClient.invalidateQueries({ queryKey: ["followers"] }),
        queryClient.invalidateQueries({ queryKey: ["following"] }),
        queryClient.invalidateQueries({ queryKey: ["user"] }),
      ]);

      toast.success(t("settings:save.success"));
    },
    onError: () => {
      toast.error(t("settings:save.error"));
    },
  });
}

export function useFollowUser() {
  return useFollowMutation(apiEndpoints.followUser);
}

export function useUnfollowUser() {
  return useFollowMutation(apiEndpoints.unfollowUser);
}

import { type QueryKey, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const ITEMS_PER_PAGE = 50;

export function userActivitiesQueryKey(userId: string) {
  return ["user-activities", userId];
}

export function globalActivitiesQueryKey() {
  return ["global-activities"];
}

export function followingActivitiesQueryKey() {
  return ["following-activities"];
}

export function useUserActivities(userId: string) {
  return useInfiniteQuery({
    queryKey: userActivitiesQueryKey(userId),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetActivitiesByUserResponse>(apiEndpoints.getActivitiesByUserId(userId), {
          params: {
            page: pageParam,
            itemsPerPage: ITEMS_PER_PAGE,
          },
        })
        .then(({ data }) => data.activities),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
    enabled: !!userId,
  });
}

export function useGlobalActivities() {
  return useInfiniteQuery({
    queryKey: globalActivitiesQueryKey(),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetActivitiesByUserResponse>(apiEndpoints.getActivities, {
          params: {
            page: pageParam,
            itemsPerPage: ITEMS_PER_PAGE,
          },
        })
        .then(({ data }) => data.activities),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
  });
}

export function useFollowingActivities(enabled = true) {
  return useInfiniteQuery({
    queryKey: followingActivitiesQueryKey(),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetActivitiesByUserResponse>(apiEndpoints.getActivitiesFollowing, {
          params: {
            page: pageParam,
            itemsPerPage: ITEMS_PER_PAGE,
          },
        })
        .then(({ data }) => data.activities),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
    enabled,
  });
}

interface ToggleActivityReactionArgs {
  activityId: string;
  /** The current user's existing reaction on this activity, if any. */
  currentReaction?: ApiTypes.ActivityReaction;
  emoji: string;
}

/**
 * Toggles the current user's emoji reaction on an activity. One reaction per user
 * (DB unique constraint): clicking the same emoji removes it, a different emoji
 * replaces it (delete old, then create new).
 */
export function useToggleActivityReaction(queryKey: QueryKey) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, currentReaction, emoji }: ToggleActivityReactionArgs) => {
      if (currentReaction) {
        await api.delete(apiEndpoints.deleteReaction(currentReaction.id));
        if (currentReaction.emoji === emoji) return;
      }

      await api.post(apiEndpoints.addReaction, {
        type: "Activity",
        emoji,
        activityId,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
}

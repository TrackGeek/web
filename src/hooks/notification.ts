import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const ITEMS_PER_PAGE = 20;

export function notificationsQueryKey() {
  return ["notifications"];
}

export function unreadNotificationsCountQueryKey() {
  return ["notifications", "unread-count"];
}

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationsQueryKey(),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetNotificationsResponse>(apiEndpoints.getNotifications, {
          params: {
            page: pageParam,
            itemsPerPage: ITEMS_PER_PAGE,
          },
        })
        .then(({ data }) => data.notifications),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: unreadNotificationsCountQueryKey(),
    queryFn: () =>
      api
        .get<ApiTypes.GetUnreadNotificationsCountResponse>(apiEndpoints.getUnreadNotificationsCount)
        .then(({ data }) => data.count),
  });
}

// ["notifications"] is a prefix of the unread-count key, so invalidating it refreshes the list and
// the header badge in one shot.
function useNotificationMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey() }),
  });
}

export function useToggleNotificationRead() {
  return useNotificationMutation(({ notificationId, isRead }: { notificationId: string; isRead: boolean }) =>
    isRead
      ? api.delete(apiEndpoints.markNotificationAsUnread(notificationId))
      : api.post(apiEndpoints.markNotificationAsRead(notificationId)),
  );
}

export function useMarkAllNotificationsAsRead() {
  return useNotificationMutation(() => api.post(apiEndpoints.markAllNotificationsAsRead));
}

export function useMarkAllNotificationsAsUnread() {
  return useNotificationMutation(() => api.delete(apiEndpoints.markAllNotificationsAsUnread));
}

export function useDeleteNotification() {
  return useNotificationMutation((notificationId: string) =>
    api.delete(apiEndpoints.deleteNotification(notificationId)),
  );
}

export function useDeleteAllNotifications() {
  return useNotificationMutation(() => api.delete(apiEndpoints.deleteAllNotifications));
}

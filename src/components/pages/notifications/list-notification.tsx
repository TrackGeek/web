import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteNotification, useNotifications, useToggleNotificationRead } from "@/hooks/notification";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll";
import { NotificationItem } from "./item";

export function NotificationList() {
  const { t } = useTranslation();

  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications();

  const toggleRead = useToggleNotificationRead();
  const deleteNotification = useDeleteNotification();

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  const notifications = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col w-full gap-y-3">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={`notification-skeleton-${index}`} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon="lucide:circle-alert" />
          </EmptyMedia>
          <EmptyTitle>{t("common:somethingWentWrong")}</EmptyTitle>
          <EmptyDescription>{t("common:tryAgainLater")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => refetch()}>
            {t("common:tryAgain")}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (notifications.length === 0) {
    return (
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon="lucide:bell-off" />
          </EmptyMedia>
          <EmptyTitle>{t("notifications:empty.title")}</EmptyTitle>
          <EmptyDescription>{t("notifications:empty.description")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col w-full gap-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          isPending={toggleRead.isPending || deleteNotification.isPending}
          onToggleRead={() =>
            toggleRead.mutate(
              { notificationId: notification.id, isRead: notification.readAt !== null },
              { onError: () => toast.error(t("common:somethingWentWrong")) },
            )
          }
          onDelete={() =>
            deleteNotification.mutate(notification.id, {
              onError: () => toast.error(t("common:somethingWentWrong")),
            })
          }
        />
      ))}

      <div ref={sentinelRef} className="h-px" />

      {isFetchingNextPage && <Skeleton className="h-20 w-full rounded-2xl" />}
    </div>
  );
}

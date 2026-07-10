import { Icon } from "@iconify/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NotificationList } from "@/components/pages/notifications/list-notification";
import { NotificationPreferences } from "@/components/pages/notifications/notification-preferences";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDeleteAllNotifications,
  useMarkAllNotificationsAsRead,
  useMarkAllNotificationsAsUnread,
  useNotifications,
  useUnreadNotificationsCount,
} from "@/hooks/notification";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [...seo({ title: "Notifications" })],
  }),
  validateSearch: (search): { paymentId?: string } => ({
    ...(search.paymentId ? { paymentId: search.paymentId as string } : {}),
  }),
  component: NotificationsRoute,
});

function NotificationsRoute() {
  const { t } = useTranslation();

  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  const { data } = useNotifications();
  const { data: unreadCount } = useUnreadNotificationsCount();

  const markAllAsRead = useMarkAllNotificationsAsRead();
  const markAllAsUnread = useMarkAllNotificationsAsUnread();
  const deleteAllNotifications = useDeleteAllNotifications();

  const total = data?.pages[0]?.total ?? 0;
  const unread = unreadCount ?? 0;
  const isPending = markAllAsRead.isPending || markAllAsUnread.isPending || deleteAllNotifications.isPending;

  const onError = () => toast.error(t("common:somethingWentWrong"));

  return (
    <div className="flex flex-col gap-6">
      <NotificationPreferences />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon={"lucide:bell"} className="size-5" />
            {t("notifications:title")}
          </CardTitle>
          <CardDescription>{t("notifications:description")}</CardDescription>
          <CardAction>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                disabled={isPending || unread === 0}
                onClick={() => markAllAsRead.mutate(undefined, { onError })}
              >
                {t("notifications:markAllAsRead")}
              </Button>

              <Button
                variant="outline"
                disabled={isPending || total === 0 || unread === total}
                onClick={() => markAllAsUnread.mutate(undefined, { onError })}
              >
                {t("notifications:markAllAsUnread")}
              </Button>

              <Button
                variant="destructive"
                disabled={isPending || total === 0}
                onClick={() => setIsDeleteAllOpen(true)}
              >
                {t("notifications:deleteAll")}
              </Button>
            </div>
          </CardAction>
        </CardHeader>

        <CardContent>
          <NotificationList />
        </CardContent>
      </Card>

      <Dialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("notifications:deleteAllTitle")}</DialogTitle>

            <DialogDescription>{t("notifications:deleteAllDescription")}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("notifications:cancel")}</Button>
            </DialogClose>

            <Button
              variant="destructive"
              disabled={deleteAllNotifications.isPending}
              onClick={() =>
                deleteAllNotifications.mutate(undefined, {
                  onSuccess: () => setIsDeleteAllOpen(false),
                  onError,
                })
              }
            >
              {t("notifications:deleteAll")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

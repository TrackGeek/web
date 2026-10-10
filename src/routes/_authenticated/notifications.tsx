import { Icon } from "@iconify/react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { NotificationList } from "@/components/pages/notifications/list-notification";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      <Card>
        <CardHeader className="max-md:flex max-md:flex-col">
          <CardTitle className="flex items-center gap-2">
            <Icon icon={"lucide:bell"} className="size-5" />
            {t("common:notifications")}
          </CardTitle>
          <CardDescription>{t("notifications:description")}</CardDescription>
          <CardAction className="flex md:flex-wrap items-center gap-2 max-md:w-full">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isPending || unread === 0}
              onClick={() => markAllAsRead.mutate(undefined, { onError })}
            >
              <Icon icon="lucide:mail-open" className="size-4" />
              {t("notifications:markAllAsRead")}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label={t("common:showMore")}>
                  <Icon icon="lucide:ellipsis" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={isPending || total === 0 || unread === total}
                  onSelect={() => markAllAsUnread.mutate(undefined, { onError })}
                >
                  <Icon icon="lucide:mail" className="size-4 text-white" />
                  {t("notifications:markAllAsUnread")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isPending || total === 0}
                  onSelect={() => setIsDeleteAllOpen(true)}
                >
                  <Icon icon="lucide:trash" className="size-4" />
                  {t("notifications:deleteAll")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <Button variant="outline">{t("common:cancel")}</Button>
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

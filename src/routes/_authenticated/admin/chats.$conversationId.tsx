import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDeleteMessage, useAdminMessages } from "@/hooks/admin";
import { seo } from "@/lib/utils/seo";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll";

export const Route = createFileRoute("/_authenticated/admin/chats/$conversationId")({
  head: () => ({
    meta: [...seo({ title: "Admin - Chat" })],
  }),
  component: AdminChatRoute,
});

function AdminChatRoute() {
  const { t } = useTranslation();
  const { conversationId } = Route.useParams();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdminMessages(conversationId);
  const deleteMessage = useAdminDeleteMessage(conversationId);

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  const conversation = data?.pages[0]?.conversation;
  const messages = [...(data?.pages.flatMap((page) => page.messages.items) ?? [])].reverse();

  const senderName = (senderId: string | null) => {
    const sender = [conversation?.userA, conversation?.userB].find((user) => user && user.id === senderId);

    return sender ? `@${sender.username}` : t("chat:deletedUser");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link to="/admin/chats" aria-label={t("admin:backToChats")} className="text-muted-foreground">
            <Icon icon="lucide:arrow-left" className="size-5" />
          </Link>
          {conversation
            ? t("admin:conversationBetween", {
                userA: conversation.userA?.username ?? t("chat:deletedUser"),
                userB: conversation.userB?.username ?? t("chat:deletedUser"),
              })
            : t("admin:chats")}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div ref={sentinelRef} className="h-px" />
        {isFetchingNextPage && <Skeleton className="h-12 w-full" />}

        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("admin:noMessages")}</p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
              <div className="min-w-0 flex-1 flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{senderName(message.senderId)}</span>
                  <time dateTime={message.createdAt}>{format(new Date(message.createdAt), "dd/MM/yyyy HH:mm:ss")}</time>
                  {message.deletedAt && (
                    <Badge variant="destructive">
                      {message.deletedBy === "Admin" ? t("admin:removedByAdmin") : t("admin:deletedByAuthor")}
                    </Badge>
                  )}
                </div>

                {message.type === "Sticker" ? (
                  <img src="/logo.svg" alt={t("chat:stickerAlt")} className="h-10 w-auto self-start" />
                ) : (
                  <p
                    className={
                      message.deletedAt
                        ? "whitespace-pre-wrap break-words text-sm text-muted-foreground"
                        : "whitespace-pre-wrap break-words text-sm"
                    }
                  >
                    {message.content}
                  </p>
                )}
              </div>

              {!message.deletedAt && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("admin:removeMessage")}
                  disabled={deleteMessage.isPending}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    deleteMessage.mutate(message.id, {
                      onSuccess: () => toast.success(t("admin:removeMessageSuccess")),
                      onError: () => toast.error(t("admin:removeMessageError")),
                    })
                  }
                >
                  <Icon icon="lucide:trash-2" className="size-4" />
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

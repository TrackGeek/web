import { Icon } from "@iconify/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { useQueryState } from "nuqs";
import { useTranslation } from "react-i18next";
import { ChatAvatar } from "@/components/pages/messages/chat-avatar";
import { SearchInput } from "@/components/shared/search-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminConversations } from "@/hooks/admin";
import { seo } from "@/lib/utils/seo";
import { useDebounce } from "@/lib/utils/useDebounce";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll";

export const Route = createFileRoute("/_authenticated/admin/chats/")({
  head: () => ({
    meta: [...seo({ title: "Admin - Chats" })],
  }),
  component: AdminChatsRoute,
});

function AdminChatsRoute() {
  const { t } = useTranslation();

  const [search, setSearch] = useQueryState("q", { defaultValue: "" });
  const debouncedSearch = useDebounce(search.trim(), 300);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useAdminConversations(debouncedSearch);

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  const conversations = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon icon="lucide:messages-square" className="size-5" />
          {t("admin:chats")}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <SearchInput
          value={search}
          onChange={(value) => setSearch(value || null)}
          placeholder={t("admin:searchPlaceholder")}
        />

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="lucide:message-circle" />
              </EmptyMedia>
              <EmptyTitle>{t("admin:noConversations")}</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                to="/admin/chats/$conversationId"
                params={{ conversationId: conversation.id }}
                className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-muted"
              >
                <div className="flex -space-x-2">
                  <ChatAvatar user={conversation.userA} size={36} />
                  <ChatAvatar user={conversation.userB} size={36} />
                </div>

                <span className="min-w-0 flex-1 truncate font-semibold">
                  {t("admin:conversationBetween", {
                    userA: conversation.userA?.username ?? t("chat:deletedUser"),
                    userB: conversation.userB?.username ?? t("chat:deletedUser"),
                  })}
                </span>

                {conversation.lastMessageAt && (
                  <time className="shrink-0 text-xs text-muted-foreground" dateTime={conversation.lastMessageAt}>
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                  </time>
                )}
              </Link>
            ))}

            <div ref={sentinelRef} className="h-px" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

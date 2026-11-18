import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatConversations, useIsTyping } from "@/hooks/chat";
import { usePresenceSubscription } from "@/hooks/presence";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll";
import { ChatAvatar } from "./chat-avatar";
import { MessageContent } from "./message-content";

interface ConversationListProps {
  search: string;
  activeId?: string;
}

export function ConversationList({ search, activeId }: ConversationListProps) {
  const { t } = useTranslation();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useChatConversations();

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  usePresenceSubscription(data?.pages.flatMap((page) => page.items.map((item) => item.otherUser?.id)) ?? []);

  const term = search.trim().toLowerCase();
  const conversations = (data?.pages.flatMap((page) => page.items) ?? []).filter(
    ({ otherUser }) =>
      !term ||
      (otherUser
        ? otherUser.name.toLowerCase().includes(term) || otherUser.username.toLowerCase().includes(term)
        : t("chat:deletedUser").toLowerCase().includes(term)),
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon="lucide:message-circle" />
          </EmptyMedia>
          <EmptyTitle>{t("chat:emptyConversations.title")}</EmptyTitle>
          <EmptyDescription>{t("chat:emptyConversations.description")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 p-2">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          to="/messages/$conversationId"
          params={{ conversationId: conversation.id }}
          aria-current={conversation.id === activeId ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted",
            conversation.id === activeId && "bg-muted",
          )}
        >
          <ChatAvatar
            user={conversation.otherUser}
            size={44}
            showPresence
            fallbackPresence={conversation.otherUserPresence}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-semibold">{conversation.otherUser?.name ?? t("chat:deletedUser")}</span>
              {conversation.lastMessageAt && (
                <time className="shrink-0 text-xs text-muted-foreground" dateTime={conversation.lastMessageAt}>
                  {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                </time>
              )}
            </div>

            <ConversationPreview conversation={conversation} />
          </div>

          {conversation.unreadCount > 0 && (
            <Badge variant="destructive" className="shrink-0">
              <span className="sr-only">{t("chat:unreadCount", { count: conversation.unreadCount })}</span>
              <span aria-hidden="true">{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}</span>
            </Badge>
          )}
        </Link>
      ))}

      <div ref={sentinelRef} className="h-px" />
    </div>
  );
}

function ConversationPreview({ conversation }: { conversation: ApiTypes.ChatConversation }) {
  const { t } = useTranslation();

  const isTyping = useIsTyping(conversation.id);

  if (isTyping) return <p className="line-clamp-1 text-sm italic text-primary">{t("chat:typing")}</p>;

  if (!conversation.lastMessage) return null;

  return <MessageContent message={conversation.lastMessage} className="line-clamp-1 text-muted-foreground" />;
}

import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatConversations,
  useChatMessages,
  useDeleteChatMessage,
  useIsTyping,
  useMarkChatConversationRead,
} from "@/hooks/chat";
import { usePresence, usePresenceSubscription } from "@/hooks/presence";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll";
import { ChatAvatar } from "./chat-avatar";
import { Composer } from "./composer";
import { MessageBubble } from "./message-bubble";
import { PresenceStatus } from "./presence-status";
import { TypingBubble } from "./typing-bubble";

const NEAR_BOTTOM_PX = 160;

function subscribeVisibility(listener: () => void) {
  document.addEventListener("visibilitychange", listener);

  return () => document.removeEventListener("visibilitychange", listener);
}

function useIsDocumentVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => true,
  );
}

interface ThreadProps {
  conversationId: string;
}

export function Thread({ conversationId }: ThreadProps) {
  const { t } = useTranslation();
  const session = useSession();

  const sessionUserId = session.data?.user?.id;

  const { data: conversationsData } = useChatConversations();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useChatMessages(conversationId);
  const deleteMessage = useDeleteChatMessage(conversationId);
  const markRead = useMarkChatConversationRead();

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isVisible = useIsDocumentVisible();
  const isTyping = useIsTyping(conversationId);

  const conversation = conversationsData?.pages
    .flatMap((page) => page.items)
    .find((item) => item.id === conversationId);
  const messages = [...(data?.pages.flatMap((page) => page.items) ?? [])].reverse();
  const firstPage = data?.pages[0];
  const otherUser = firstPage ? firstPage.otherUser : conversation?.otherUser;
  const { data: livePresence } = usePresence(otherUser?.id);

  usePresenceSubscription([otherUser?.id]);

  const presence: ApiTypes.PresenceState = livePresence ??
    firstPage?.otherUserPresence ??
    conversation?.otherUserPresence ?? { hidden: true };
  const otherUserLastReadAt = firstPage?.otherUserLastReadAt ?? conversation?.otherUserLastReadAt ?? null;
  const newestId = messages.at(-1)?.id;
  const unreadCount = conversation?.unreadCount ?? 0;

  useEffect(() => {
    if (newestId) bottomRef.current?.scrollIntoView({ block: "end" });
  }, [newestId]);

  useEffect(() => {
    const container = scrollRef.current;

    if (!isTyping || !container) return;

    if (container.scrollHeight - container.scrollTop - container.clientHeight < NEAR_BOTTOM_PX) {
      bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    }
  }, [isTyping]);

  useEffect(() => {
    if (isVisible) markRead.mutate(conversationId);
  }, [isVisible, conversationId, markRead.mutate]);

  useEffect(() => {
    if (isVisible && unreadCount > 0) markRead.mutate(conversationId);
  }, [isVisible, unreadCount, conversationId, markRead.mutate]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border p-3">
        <Link
          to="/messages"
          aria-label={t("chat:backToMessages")}
          className="text-muted-foreground hover:text-foreground md:hidden"
        >
          <Icon icon="lucide:arrow-left" className="size-5" />
        </Link>

        {otherUser ? (
          <div className="flex items-center gap-3">
            <ChatAvatar user={otherUser} size={36} showPresence fallbackPresence={presence} />
            <div className="flex flex-col leading-tight">
              <Link
                to="/user/$username"
                params={{ username: otherUser.username }}
                className="font-semibold hover:underline"
              >
                {otherUser.name}
              </Link>
              <PresenceStatus conversationId={conversationId} user={otherUser} fallback={presence} />
            </div>
          </div>
        ) : otherUser === null ? (
          <div className="flex items-center gap-3">
            <ChatAvatar user={null} size={36} />
            <span className="font-semibold">{t("chat:deletedUser")}</span>
          </div>
        ) : (
          <span className="font-semibold">{t("chat:unknownUser")}</span>
        )}
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        <div ref={sentinelRef} className="h-px shrink-0" />
        {isFetchingNextPage && <Skeleton className="h-8 w-40 shrink-0" />}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-48 rounded-2xl" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="m-auto text-sm text-muted-foreground">{t("chat:emptyMessages")}</p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === sessionUserId}
              isRead={Boolean(otherUserLastReadAt && new Date(message.createdAt) <= new Date(otherUserLastReadAt))}
              onDelete={(messageId) =>
                deleteMessage.mutate(messageId, { onError: () => toast.error(t("chat:deleteError")) })
              }
            />
          ))
        )}

        {isTyping && <TypingBubble />}

        <div ref={bottomRef} className="shrink-0" />
      </div>

      <Composer conversationId={conversationId} disabled={otherUser === null} />
    </div>
  );
}

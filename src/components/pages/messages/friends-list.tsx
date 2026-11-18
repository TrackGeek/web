import { Icon } from "@iconify/react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatFriends, useStartChatConversation } from "@/hooks/chat";
import { usePresence, usePresenceSubscription, usePresences } from "@/hooks/presence";
import type { ApiTypes } from "@/lib/api";
import { ChatAvatar } from "./chat-avatar";

interface FriendsListProps {
  search: string;
  onStarted?: () => void;
}

export function FriendsList({ search, onStarted }: FriendsListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading } = useChatFriends();
  const startConversation = useStartChatConversation();

  const term = search.trim().toLowerCase();
  const friends = (data ?? []).filter(
    (friend) => !term || friend.name.toLowerCase().includes(term) || friend.username.toLowerCase().includes(term),
  );

  const friendIds = friends.map((friend) => friend.id);

  usePresenceSubscription(friendIds);

  const presences = usePresences(friendIds);

  const isOnline = (friend: ApiTypes.ChatFriend) => {
    const presence = presences[friend.id] ?? friend.presence;

    return !("hidden" in presence) && presence.status !== "offline";
  };

  const sections = [
    { key: "online", title: t("chat:statusOnline"), items: friends.filter(isOnline) },
    { key: "offline", title: t("chat:statusOffline"), items: friends.filter((friend) => !isOnline(friend)) },
  ].filter((section) => section.items.length > 0);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon="lucide:users" />
          </EmptyMedia>
          <EmptyTitle>{t("chat:emptyFriends.title")}</EmptyTitle>
          <EmptyDescription>{t("chat:emptyFriends.description")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <section key={section.key} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground">{section.title}</h3>

          {section.items.map((friend) => (
            <FriendRow
              key={friend.id}
              friend={friend}
              isPending={startConversation.isPending}
              onMessage={() =>
                startConversation.mutate(friend.id, {
                  onSuccess: (conversation) => {
                    onStarted?.();
                    navigate({ to: "/messages/$conversationId", params: { conversationId: conversation.id } });
                  },
                  onError: () => toast.error(t("chat:startError")),
                })
              }
            />
          ))}
        </section>
      ))}
    </div>
  );
}

function FriendRow({
  friend,
  isPending,
  onMessage,
}: {
  friend: ApiTypes.ChatFriend;
  isPending: boolean;
  onMessage: () => void;
}) {
  const { t } = useTranslation();

  const { data } = usePresence(friend.id);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 p-3">
      <ChatAvatar user={friend} size={44} showPresence fallbackPresence={data ?? friend.presence} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{friend.name}</p>
        <p className="truncate text-sm text-muted-foreground">@{friend.username}</p>
      </div>

      <Button variant="outline" size="sm" disabled={isPending} onClick={onMessage}>
        <Icon icon="lucide:message-circle" className="size-4" />
        {t("chat:message")}
      </Button>
    </div>
  );
}

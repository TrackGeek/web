import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useChatFriends, useStartChatConversation } from "@/hooks/chat";
import { usePresenceSubscription, usePresences } from "@/hooks/presence";
import type { ApiTypes } from "@/lib/api";
import { ChatAvatar } from "./chat-avatar";

interface OnlineFriendsStripProps {
  search: string;
}

const STATUS_ORDER: Record<ApiTypes.PresenceStatus, number> = { online: 0, away: 1, offline: 2 };

export function OnlineFriendsStrip({ search }: OnlineFriendsStripProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useChatFriends();
  const startConversation = useStartChatConversation();

  const term = search.trim().toLowerCase();
  const friends = (data ?? []).filter(
    (friend) => !term || friend.name.toLowerCase().includes(term) || friend.username.toLowerCase().includes(term),
  );
  const friendIds = friends.map((friend) => friend.id);

  usePresenceSubscription(friendIds);

  const presences = usePresences(friendIds);

  const statusOf = (friend: ApiTypes.ChatFriend) => {
    const presence = presences[friend.id] ?? friend.presence;

    return "hidden" in presence ? "offline" : presence.status;
  };

  const online = friends
    .map((friend) => ({ friend, status: statusOf(friend) }))
    .filter(({ status }) => status !== "offline")
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  if (online.length === 0) return null;

  return (
    <section className="border-b border-border px-3 py-3">
      <h2 className="pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("chat:statusOnline")}
      </h2>

      <ul className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {online.map(({ friend }) => (
          <li key={friend.id} className="shrink-0">
            <button
              type="button"
              disabled={startConversation.isPending}
              aria-label={friend.name}
              title={friend.name}
              className="flex w-16 cursor-pointer flex-col items-center gap-1 rounded-lg p-1 transition-colors hover:bg-muted disabled:cursor-wait"
              onClick={() =>
                startConversation.mutate(friend.id, {
                  onSuccess: (conversation) =>
                    navigate({ to: "/messages/$conversationId", params: { conversationId: conversation.id } }),
                  onError: () => toast.error(t("chat:startError")),
                })
              }
            >
              <ChatAvatar user={friend} size={48} showPresence fallbackPresence={friend.presence} />
              <span className="w-full truncate text-center text-xs">{friend.name.split(" ")[0]}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

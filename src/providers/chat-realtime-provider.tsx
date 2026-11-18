import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import {
  addMessageToCache,
  chatConversationsQueryKey,
  patchMessageInCache,
  setConversationReadInCache,
  setConversationTyping,
  setOtherUserLastReadInCache,
} from "@/hooks/chat";
import { resubscribeAllPresence, setPresenceInCache, toPresenceState } from "@/hooks/presence";
import type { ApiTypes } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { isUserActive, startActivityTracker, subscribeActivity } from "@/lib/presence/activity";
import { connectChatSocket, disconnectChatSocket } from "@/lib/socket";

interface ChatRealtimeProviderProps {
  children: ReactNode;
}

export function ChatRealtimeProvider({ children }: ChatRealtimeProviderProps) {
  const queryClient = useQueryClient();
  const session = useSession();

  const userId = session.data?.user?.id;

  useEffect(() => {
    if (!userId) {
      disconnectChatSocket();
      return;
    }

    const stopTracker = startActivityTracker();
    const socket = connectChatSocket();

    const emitActivity = () => socket.emit("presence:activity", { active: isUserActive() });
    const onConnect = () => {
      emitActivity();
      resubscribeAllPresence();
    };
    const unsubscribeActivity = subscribeActivity(emitActivity);

    const onMessageNew = (message: ApiTypes.ChatMessage) => {
      if (message.senderId !== userId) setConversationTyping(message.conversationId, false);
      addMessageToCache(queryClient, message);
      queryClient.invalidateQueries({ queryKey: chatConversationsQueryKey() });
    };

    const onMessageDeleted = (message: ApiTypes.ChatMessage) => {
      patchMessageInCache(queryClient, message);
      queryClient.invalidateQueries({ queryKey: chatConversationsQueryKey() });
    };

    const onConversationRead = ({
      conversationId,
      userId: readerId,
      lastReadAt,
    }: {
      conversationId: string;
      userId: string;
      lastReadAt: string;
    }) => {
      if (readerId === userId) setConversationReadInCache(queryClient, conversationId);
      else setOtherUserLastReadInCache(queryClient, conversationId, lastReadAt);
    };

    const onPresenceUpdate = (payload: {
      userId: string;
      status?: ApiTypes.PresenceStatus;
      lastSeenAt?: string | null;
      hidden?: true;
    }) => setPresenceInCache(queryClient, payload.userId, toPresenceState(payload));

    const onTyping = ({
      conversationId,
      userId: typingUserId,
      isTyping,
    }: {
      conversationId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      if (typingUserId !== userId) setConversationTyping(conversationId, isTyping);
    };

    socket.on("connect", onConnect);
    socket.on("message:new", onMessageNew);
    socket.on("message:deleted", onMessageDeleted);
    socket.on("conversation:read", onConversationRead);
    socket.on("presence:update", onPresenceUpdate);
    socket.on("typing", onTyping);

    return () => {
      stopTracker();
      unsubscribeActivity();
      socket.off("connect", onConnect);
      socket.off("message:new", onMessageNew);
      socket.off("message:deleted", onMessageDeleted);
      socket.off("conversation:read", onConversationRead);
      socket.off("presence:update", onPresenceUpdate);
      socket.off("typing", onTyping);
    };
  }, [userId, queryClient]);

  return children;
}

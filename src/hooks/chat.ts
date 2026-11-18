import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth/client";
import { connectChatSocket } from "@/lib/socket";
import { hmrSingleton } from "@/lib/utils/hmr-singleton";
import { seedPresence } from "./presence";

const CONVERSATIONS_PER_PAGE = 50;
const MESSAGES_PER_PAGE = 30;

type MessagesData = InfiniteData<ApiTypes.ChatMessagesPage, string | undefined>;
type ConversationsData = InfiniteData<ApiTypes.PaginatedResponse<ApiTypes.ChatConversation>, number>;

export function chatFriendsQueryKey() {
  return ["chat", "friends"];
}

export function chatConversationsQueryKey() {
  return ["chat", "conversations"];
}

export function chatMessagesQueryKey(conversationId: string) {
  return ["chat", "messages", conversationId];
}

export function addMessageToCache(queryClient: QueryClient, message: ApiTypes.ChatMessage) {
  queryClient.setQueryData<MessagesData>(chatMessagesQueryKey(message.conversationId), (data) => {
    if (!data) return data;
    if (data.pages.some((page) => page.items.some((item) => item.id === message.id))) return data;

    const [first, ...rest] = data.pages;

    return { ...data, pages: [{ ...first, items: [message, ...first.items] }, ...rest] };
  });
}

export function patchMessageInCache(queryClient: QueryClient, message: ApiTypes.ChatMessage) {
  queryClient.setQueryData<MessagesData>(chatMessagesQueryKey(message.conversationId), (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => (item.id === message.id ? message : item)),
          })),
        }
      : data,
  );
}

export function setOtherUserLastReadInCache(queryClient: QueryClient, conversationId: string, lastReadAt: string) {
  queryClient.setQueryData<MessagesData>(chatMessagesQueryKey(conversationId), (data) =>
    data ? { ...data, pages: data.pages.map((page) => ({ ...page, otherUserLastReadAt: lastReadAt })) } : data,
  );
  queryClient.setQueryData<ConversationsData>(chatConversationsQueryKey(), (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === conversationId ? { ...item, otherUserLastReadAt: lastReadAt } : item,
            ),
          })),
        }
      : data,
  );
}

export function setConversationReadInCache(queryClient: QueryClient, conversationId: string) {
  queryClient.setQueryData<ConversationsData>(chatConversationsQueryKey(), (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((item) => (item.id === conversationId ? { ...item, unreadCount: 0 } : item)),
          })),
        }
      : data,
  );
}

export function useChatFriends() {
  return useQuery({
    queryKey: chatFriendsQueryKey(),
    queryFn: () =>
      api.get<ApiTypes.GetChatFriendsResponse>(apiEndpoints.getChatFriends).then(({ data }) => {
        for (const friend of data.friends) seedPresence(friend.id, friend.presence);

        return data.friends;
      }),
  });
}

export function useChatConversations() {
  const session = useSession();

  return useInfiniteQuery({
    queryKey: chatConversationsQueryKey(),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetChatConversationsResponse>(apiEndpoints.getChatConversations, {
          params: { page: pageParam, itemsPerPage: CONVERSATIONS_PER_PAGE },
        })
        .then(({ data }) => {
          for (const item of data.conversations.items) seedPresence(item.otherUser?.id, item.otherUserPresence);

          return data.conversations;
        }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
    enabled: Boolean(session.data?.user),
  });
}

export function useChatUnreadCount() {
  const { data } = useChatConversations();

  return data?.pages.reduce((sum, page) => sum + page.items.reduce((acc, item) => acc + item.unreadCount, 0), 0) ?? 0;
}

export function useChatMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: chatMessagesQueryKey(conversationId),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetChatMessagesResponse>(apiEndpoints.getChatMessages(conversationId), {
          params: { cursor: pageParam, limit: MESSAGES_PER_PAGE },
        })
        .then(({ data }) => {
          seedPresence(data.otherUser?.id, data.otherUserPresence);

          return {
            ...data.messages,
            otherUser: data.otherUser,
            otherUserPresence: data.otherUserPresence,
            otherUserLastReadAt: data.otherUserLastReadAt,
          };
        }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined),
  });
}

export function useStartChatConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      api
        .post<ApiTypes.StartChatConversationResponse>(apiEndpoints.startChatConversation, { userId })
        .then(({ data }) => data.conversation),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatConversationsQueryKey() }),
  });
}

export interface SendChatMessageInput {
  type: ApiTypes.MessageType;
  content: string;
}

export function useSendChatMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendChatMessageInput) =>
      api
        .post<ApiTypes.SendChatMessageResponse>(apiEndpoints.sendChatMessage(conversationId), input)
        .then(({ data }) => data.message),
    onSuccess: (message) => {
      addMessageToCache(queryClient, message);
      queryClient.invalidateQueries({ queryKey: chatConversationsQueryKey() });
    },
  });
}

export function useDeleteChatMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => api.delete(apiEndpoints.deleteChatMessage(messageId)),
    onSuccess: (_, messageId) => {
      queryClient.setQueryData<MessagesData>(chatMessagesQueryKey(conversationId), (data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                items: page.items.map((item) =>
                  item.id === messageId
                    ? { ...item, content: null, deletedAt: new Date().toISOString(), deletedBy: "Author" as const }
                    : item,
                ),
              })),
            }
          : data,
      );
      queryClient.invalidateQueries({ queryKey: chatConversationsQueryKey() });
    },
  });
}

export function useMarkChatConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => api.post(apiEndpoints.markChatConversationRead(conversationId)),
    onSuccess: (_, conversationId) => setConversationReadInCache(queryClient, conversationId),
  });
}

const TYPING_TTL = 5000;
const TYPING_START_INTERVAL = 3000;
const TYPING_STOP_DELAY = 4000;

const typingStore = hmrSingleton("chatTyping", () => ({
  listeners: new Set<() => void>(),
  timers: new Map<string, ReturnType<typeof setTimeout>>(),
  snapshot: new Set<string>() as ReadonlySet<string>,
}));

function publishTyping(next: ReadonlySet<string>) {
  typingStore.snapshot = next;
  for (const listener of typingStore.listeners) listener();
}

export function setConversationTyping(conversationId: string, isTyping: boolean) {
  const timer = typingStore.timers.get(conversationId);

  if (timer) clearTimeout(timer);

  typingStore.timers.delete(conversationId);

  if (isTyping) {
    typingStore.timers.set(
      conversationId,
      setTimeout(() => setConversationTyping(conversationId, false), TYPING_TTL),
    );

    if (!typingStore.snapshot.has(conversationId)) publishTyping(new Set(typingStore.snapshot).add(conversationId));

    return;
  }

  if (typingStore.snapshot.has(conversationId)) {
    const next = new Set(typingStore.snapshot);

    next.delete(conversationId);
    publishTyping(next);
  }
}

function subscribeTyping(listener: () => void) {
  typingStore.listeners.add(listener);

  return () => {
    typingStore.listeners.delete(listener);
  };
}

export function useIsTyping(conversationId: string) {
  return useSyncExternalStore(
    subscribeTyping,
    () => typingStore.snapshot.has(conversationId),
    () => false,
  );
}

export function useTypingEmitter(conversationId: string) {
  const lastStartRef = useRef(0);
  const activeRef = useRef(false);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const stop = useCallback(() => {
    clearTimeout(stopTimerRef.current);

    if (!activeRef.current) return;

    activeRef.current = false;
    lastStartRef.current = 0;
    connectChatSocket().emit("typing:stop", { conversationId });
  }, [conversationId]);

  const onInput = useCallback(() => {
    const now = Date.now();

    if (!activeRef.current || now - lastStartRef.current >= TYPING_START_INTERVAL) {
      activeRef.current = true;
      lastStartRef.current = now;
      connectChatSocket().emit("typing:start", { conversationId });
    }

    clearTimeout(stopTimerRef.current);
    stopTimerRef.current = setTimeout(stop, TYPING_STOP_DELAY);
  }, [conversationId, stop]);

  useEffect(() => stop, [stop]);

  return { onInput, stop };
}

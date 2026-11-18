import { type QueryClient, useQueries, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { getChatSocket } from "@/lib/socket";
import { queryClient } from "@/lib/tanstack-query";
import { hmrSingleton } from "@/lib/utils/hmr-singleton";

const MAX_IDS = 100;
const BATCH_DELAY = 10;
const STALE_TIME = 60_000;

type Pending = { resolve: (value: ApiTypes.PresenceState) => void; reject: (reason: unknown) => void };

const store = hmrSingleton("presence", () => ({
  pending: new Map<string, Pending[]>(),
  refs: new Map<string, number>(),
  flushTimer: undefined as ReturnType<typeof setTimeout> | undefined,
}));

const { pending, refs } = store;

async function flushPresences() {
  store.flushTimer = undefined;

  const batch = new Map(pending);

  pending.clear();

  const ids = [...batch.keys()];

  for (let index = 0; index < ids.length; index += MAX_IDS) {
    const chunk = ids.slice(index, index + MAX_IDS);

    try {
      const { data } = await api.get<ApiTypes.GetPresencesResponse>(apiEndpoints.getPresences, {
        params: { userIds: chunk.join(",") },
      });

      for (const id of chunk) {
        const state = data.presences[id] ?? { status: "offline" as const, lastSeenAt: null };

        for (const entry of batch.get(id) ?? []) entry.resolve(state);
      }
    } catch (error) {
      for (const id of chunk) for (const entry of batch.get(id) ?? []) entry.reject(error);
    }
  }
}

function fetchPresence(userId: string) {
  return new Promise<ApiTypes.PresenceState>((resolve, reject) => {
    pending.set(userId, [...(pending.get(userId) ?? []), { resolve, reject }]);

    if (!store.flushTimer) store.flushTimer = setTimeout(flushPresences, BATCH_DELAY);
  });
}

export function presenceQueryKey(userId: string) {
  return ["presence", userId];
}

export function toPresenceState(payload: {
  hidden?: true;
  status?: ApiTypes.PresenceStatus;
  lastSeenAt?: string | null;
}): ApiTypes.PresenceState {
  return payload.hidden || !payload.status
    ? { hidden: true }
    : { status: payload.status, lastSeenAt: payload.lastSeenAt ?? null };
}

export function setPresenceInCache(client: QueryClient, userId: string, presence: ApiTypes.PresenceState) {
  client.setQueryData(presenceQueryKey(userId), presence);
}

export function seedPresence(userId: string | null | undefined, presence: ApiTypes.PresenceState | undefined) {
  if (userId && presence) setPresenceInCache(queryClient, userId, presence);
}

export function usePresence(userId?: string | null) {
  return useQuery({
    queryKey: presenceQueryKey(userId ?? ""),
    queryFn: () => fetchPresence(userId ?? ""),
    enabled: Boolean(userId),
    staleTime: STALE_TIME,
    retry: false,
  });
}

export function usePresences(userIds: string[]) {
  return useQueries({
    queries: userIds.map((userId) => ({
      queryKey: presenceQueryKey(userId),
      queryFn: () => fetchPresence(userId),
      staleTime: STALE_TIME,
      retry: false,
    })),
    combine: (results) => {
      const map: Record<string, ApiTypes.PresenceState | undefined> = {};

      userIds.forEach((userId, index) => {
        map[userId] = results[index]?.data;
      });

      return map;
    },
  });
}

function emitPresence(event: "presence:subscribe" | "presence:unsubscribe", ids: string[]) {
  const socket = getChatSocket();

  if (!socket.connected) return;

  for (let index = 0; index < ids.length; index += MAX_IDS) {
    socket.emit(event, { userIds: ids.slice(index, index + MAX_IDS) });
  }
}

function subscribeIds(ids: string[]) {
  const fresh: string[] = [];

  for (const id of ids) {
    const count = refs.get(id) ?? 0;

    refs.set(id, count + 1);

    if (count === 0) fresh.push(id);
  }

  if (fresh.length > 0) emitPresence("presence:subscribe", fresh);
}

function unsubscribeIds(ids: string[]) {
  const gone: string[] = [];

  for (const id of ids) {
    const count = (refs.get(id) ?? 1) - 1;

    if (count <= 0) {
      refs.delete(id);
      gone.push(id);
    } else {
      refs.set(id, count);
    }
  }

  if (gone.length > 0) emitPresence("presence:unsubscribe", gone);
}

export function resubscribeAllPresence() {
  const ids = [...refs.keys()];

  if (ids.length > 0) emitPresence("presence:subscribe", ids);
}

export function usePresenceSubscription(userIds: (string | null | undefined)[]) {
  const key = [...new Set(userIds.filter((id): id is string => Boolean(id)))].sort().join(",");

  useEffect(() => {
    if (!key) return;

    const ids = key.split(",");

    subscribeIds(ids);

    return () => unsubscribeIds(ids);
  }, [key]);
}

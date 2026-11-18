import { useSyncExternalStore } from "react";
import type { ApiTypes } from "@/lib/api";
import { hmrSingleton } from "@/lib/utils/hmr-singleton";

const IDLE_MS = 5 * 60 * 1000;
const CHECK_MS = 30 * 1000;
const THROTTLE_MS = 1000;
const INTERACTION_EVENTS = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;

const store = hmrSingleton("presenceActivity", () => ({
  listeners: new Set<() => void>(),
  lastInteraction: Date.now(),
  lastMark: 0,
  current: true,
}));

function compute() {
  return (
    typeof document !== "undefined" &&
    document.visibilityState === "visible" &&
    Date.now() - store.lastInteraction < IDLE_MS
  );
}

function refresh() {
  const next = compute();

  if (next === store.current) return;

  store.current = next;

  for (const listener of store.listeners) listener();
}

export function isUserActive() {
  return compute();
}

export function subscribeActivity(listener: () => void) {
  store.listeners.add(listener);

  return () => {
    store.listeners.delete(listener);
  };
}

export function startActivityTracker() {
  store.lastInteraction = Date.now();
  store.current = compute();

  const onInteraction = () => {
    const now = Date.now();

    if (now - store.lastMark < THROTTLE_MS) return;

    store.lastMark = now;
    store.lastInteraction = now;
    refresh();
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible") store.lastInteraction = Date.now();

    refresh();
  };

  for (const event of INTERACTION_EVENTS) window.addEventListener(event, onInteraction, { passive: true });

  document.addEventListener("visibilitychange", onVisibility);

  const interval = setInterval(refresh, CHECK_MS);

  return () => {
    for (const event of INTERACTION_EVENTS) window.removeEventListener(event, onInteraction);

    document.removeEventListener("visibilitychange", onVisibility);
    clearInterval(interval);
  };
}

export function useMyPresenceStatus(): Exclude<ApiTypes.PresenceStatus, "offline"> {
  return useSyncExternalStore(
    subscribeActivity,
    () => (store.current ? "online" : "away"),
    () => "online",
  );
}

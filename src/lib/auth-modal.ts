import { useSyncExternalStore } from "react";

export type AuthModalTab = "login" | "register";

interface AuthModalState {
  open: boolean;
  tab: AuthModalTab;
}

let state: AuthModalState = { open: false, tab: "login" };

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function openAuthModal(tab: AuthModalTab = "login") {
  state = { open: true, tab };
  emit();
}

export function setAuthModalOpen(open: boolean) {
  if (state.open === open) return;
  state = { ...state, open };
  emit();
}

export function useAuthModal() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

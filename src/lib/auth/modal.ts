import { useSyncExternalStore } from "react";

export type AuthModalTab = "login" | "register";

export type AuthModalStep = "form" | "twoFactor";

interface AuthModalState {
  open: boolean;
  tab: AuthModalTab;
  step: AuthModalStep;
}

let state: AuthModalState = { open: false, tab: "login", step: "form" };

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function openAuthModal(tab: AuthModalTab = "login") {
  state = { open: true, tab, step: "form" };
  emit();
}

// Called when a sign-in attempt is answered with a two factor challenge, from any login method.
export function openAuthModalTwoFactor() {
  state = { ...state, open: true, step: "twoFactor" };
  emit();
}

export function setAuthModalStep(step: AuthModalStep) {
  if (state.step === step) return;
  state = { ...state, step };
  emit();
}

export function setAuthModalOpen(open: boolean) {
  if (state.open === open) return;
  state = { ...state, open, step: open ? state.step : "form" };
  emit();
}

export function useAuthModal() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

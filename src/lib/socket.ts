import { io, type Socket } from "socket.io-client";
import { env } from "./env";
import { isUserActive } from "./presence/activity";
import { hmrSingleton } from "./utils/hmr-singleton";

const state = hmrSingleton("chatSocket", () => ({ socket: null as Socket | null }));

export function getChatSocket() {
  if (!state.socket) {
    state.socket = io(`${env.VITE_API_URL}/chat`, {
      withCredentials: true,
      autoConnect: false,
      auth: (callback) => callback({ active: isUserActive() }),
    });
  }

  return state.socket;
}

export function connectChatSocket() {
  const instance = getChatSocket();

  if (!instance.connected && !instance.active) instance.connect();

  return instance;
}

export function disconnectChatSocket() {
  state.socket?.disconnect();
}

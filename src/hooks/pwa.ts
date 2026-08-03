import { useCallback, useEffect, useState } from "react";

import { isIOS, isStandalone } from "@/lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_TOKEN = "trackgeek.install-dismissed";
const SNOOZE = 1000 * 60 * 60 * 24 * 14;

function isSnoozed() {
  try {
    const dismissedAt = Number(localStorage.getItem(DISMISSED_TOKEN));

    return Boolean(dismissedAt) && Date.now() - dismissedAt < SNOOZE;
  } catch {
    return false;
  }
}

export function useInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"prompt" | "ios">("prompt");

  useEffect(() => {
    if (isStandalone() || isSnoozed()) return;

    if (isIOS()) {
      setPlatform("ios");
      setVisible(true);

      return;
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();

      setEvent(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setEvent(null);
      setVisible(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!event) return;

    await event.prompt();

    const { outcome } = await event.userChoice;

    if (outcome === "accepted") {
      setEvent(null);
    }

    setVisible(false);
  }, [event]);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISSED_TOKEN, String(Date.now()));
    } catch {
      // storage can be unavailable, dismissal stays session-only
    }

    setVisible(false);
  }, []);

  return { visible, platform, install, dismiss };
}

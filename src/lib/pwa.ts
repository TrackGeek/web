import { toast } from "sonner";

import i18n from "@/lib/i18n/config";

export const SERVICE_WORKER_URL = "/sw.js";

export function isStandalone() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS() {
  if (typeof navigator === "undefined") return false;

  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function promptUpdate(worker: ServiceWorker) {
  toast(i18n.t("common:pwa.updateTitle"), {
    duration: Number.POSITIVE_INFINITY,
    action: {
      label: i18n.t("common:pwa.updateAction"),
      onClick: () => worker.postMessage({ type: "SKIP_WAITING" }),
    },
  });
}

export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !import.meta.env.PROD) return;

  try {
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
      scope: "/",
      updateViaCache: "none",
    });

    if (registration.waiting && navigator.serviceWorker.controller) {
      promptUpdate(registration.waiting);
    }

    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;

      if (!installing) return;

      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          promptUpdate(installing);
        }
      });
    });

    let refreshing = false;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;

      refreshing = true;
      window.location.reload();
    });
  } catch {
    // service worker is progressive enhancement, ignore failures
  }
}

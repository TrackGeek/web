import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import i18n, { getClientLanguage } from "@/lib/i18n/config";
import { registerServiceWorker } from "@/lib/pwa";

const language = getClientLanguage();

if (i18n.language !== language) {
  await i18n.changeLanguage(language);
} else {
  await i18n.loadNamespaces(i18n.options.ns as Array<string>);
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});

window.addEventListener("load", () => {
  registerServiceWorker();
});

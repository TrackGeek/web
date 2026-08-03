import { Icon } from "@iconify/react";
import { Trans, useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/pwa";

export function InstallPrompt() {
  const { t } = useTranslation();
  const { visible, platform, install, dismiss } = useInstallPrompt();

  if (!visible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 md:left-auto md:right-4 md:bottom-4 md:w-96 pb-[env(safe-area-inset-bottom)]">
      <div className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-lg">
        <img src="/icons/icon-192.png" alt="TrackGeek" className="size-10 shrink-0" />

        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-sm">{t("common:pwa.installTitle")}</p>

            <p className="text-xs text-muted-foreground">
              {platform === "ios" ? (
                <Trans
                  i18nKey="common:pwa.installIOS"
                  components={{
                    share: <Icon icon="lucide:share" className="inline size-3.5 align-text-bottom" />,
                  }}
                />
              ) : (
                t("common:pwa.installDescription")
              )}
            </p>
          </div>

          <div className="flex gap-2">
            {platform === "prompt" && (
              <Button size="sm" onClick={install}>
                <Icon icon="lucide:download" />
                {t("common:pwa.install")}
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={dismiss}>
              {t("common:pwa.notNow")}
            </Button>
          </div>
        </div>

        <Button
          size="icon-xs"
          variant="ghost"
          className="ml-auto self-start"
          aria-label={t("common:pwa.notNow")}
          onClick={dismiss}
        >
          <Icon icon="lucide:x" />
        </Button>
      </div>
    </div>
  );
}

import { Icon } from "@iconify/react";
import { Trans, useTranslation } from "react-i18next";
import { REWIND_YEAR } from "@/constants/rewind";
import { openAuthModal } from "@/lib/auth/modal";
import { RewindMotif } from "./rewind-motif";

interface RewindHeroProps {
  signedIn: boolean;
  loading: boolean;
  failed: boolean;
  empty: boolean;
  isPreview: boolean;
  onStart: () => void;
  onRetry: () => void;
  onGlobal: () => void;
}

export function RewindHero({
  signedIn,
  loading,
  failed,
  empty,
  isPreview,
  onStart,
  onRetry,
  onGlobal,
}: RewindHeroProps) {
  const { t, i18n } = useTranslation();
  const action = !signedIn ? () => openAuthModal() : failed ? onRetry : empty ? onGlobal : onStart;

  return (
    <div className="relative isolate flex min-h-full items-center overflow-clip bg-secondary-foreground text-replay-paper">
      <RewindMotif className="pointer-events-none absolute -right-50 -top-18 -z-10 w-120 -rotate-12 text-secondary opacity-20 sm:-right-32 sm:w-176 lg:right-auto lg:left-[55%] lg:opacity-100 xl:w-200" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-20 -z-10 size-80 rounded-full bg-replay-mint/10 sm:size-120"
      />
      <div className="mx-auto grid w-full max-w-360 gap-6 px-6 py-12 sm:px-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.45fr)] lg:items-end lg:gap-10 lg:px-18">
        <div className="min-w-0">
          <h1 className="min-w-0 text-[clamp(5.5rem,13vw,11rem)] leading-[0.9] font-black wrap-break-word font-stretch-72%">
            <Trans
              i18nKey="rewind:hero.title"
              values={{ year: REWIND_YEAR }}
              components={{ year: <span className="block text-[1.2em]" /> }}
            />
          </h1>
          <p className="mt-7 max-w-[32ch] text-lg leading-snug font-medium sm:text-2xl">
            {t("rewind:hero.description")}
          </p>
          <button
            type="button"
            onClick={action}
            disabled={loading}
            className="mt-8 inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-replay-ink px-7 text-base font-bold text-replay-paper transition-transform hover:scale-[1.03] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 motion-reduce:transform-none"
          >
            <Icon icon={failed ? "lucide:rotate-ccw" : "lucide:play"} className="size-5" aria-hidden="true" />
            {loading
              ? t("rewind:hero.loading")
              : !signedIn
                ? t("rewind:hero.signIn")
                : failed
                  ? t("common:tryAgain")
                  : empty
                    ? t("rewind:hero.community")
                    : t("rewind:hero.start")}
          </button>
          {failed && (
            <p role="alert" className="mt-3 max-w-sm text-sm">
              {t("rewind:hero.error")}
            </p>
          )}
          {empty && !failed && <p className="mt-3 max-w-sm text-sm">{t("rewind:hero.empty", { year: REWIND_YEAR })}</p>}
        </div>
        <div className="max-w-[26ch] text-sm leading-relaxed font-medium lg:bg-secondary-foreground lg:p-4 lg:text-base">
          <p>
            {t("rewind:hero.launch", {
              date: new Intl.DateTimeFormat(i18n.language, { dateStyle: "long", timeZone: "UTC" }).format(
                new Date("2026-08-04T00:00:00Z"),
              ),
            })}
          </p>
          {isPreview && <p className="mt-3">{t("rewind:hero.preview", { year: REWIND_YEAR })}</p>}
        </div>
      </div>
    </div>
  );
}

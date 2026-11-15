import { Icon } from "@iconify/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { REWIND_YEAR } from "@/constants/rewind";
import type { PersonalRewind } from "@/types/rewind";
import { RewindMotif } from "./rewind-motif";

export function RewindOutro({ rewind, onRestart }: { rewind?: PersonalRewind; onRestart: () => void }) {
  const { t } = useTranslation();
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");

  async function share() {
    const text = t("rewind:share.text", { year: REWIND_YEAR, count: rewind?.tracked ?? 0 });
    const url = new URL("/replay/2026", window.location.origin).href;
    try {
      if (navigator.share) {
        await navigator.share({ title: t("rewind:pageTitle", { year: REWIND_YEAR }), text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setShareState("copied");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setShareState("error");
    }
  }

  return (
    <div className="relative isolate flex min-h-full items-center overflow-clip bg-secondary-foreground text-replay-paper">
      <RewindMotif
        variant="flower"
        className="pointer-events-none absolute -right-44 -top-40 -z-10 size-144 text-secondary/20 sm:size-220"
      />
      <div className="mx-auto w-full max-w-360 px-6 py-10 sm:px-12 lg:px-18">
        <h2 className="max-w-[13ch] text-5xl leading-none font-black text-balance sm:text-7xl lg:text-8xl">
          {t("rewind:outro.title")}
        </h2>
        <p className="mt-6 max-w-[35ch] text-lg leading-snug sm:text-2xl">{t("rewind:outro.description")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {rewind && rewind.tracked > 0 && (
            <button
              type="button"
              onClick={share}
              className="inline-flex min-h-13 items-center gap-2 rounded-full bg-replay-ink px-6 font-bold text-replay-paper hover:opacity-85"
            >
              <Icon icon="lucide:share-2" className="size-5" aria-hidden="true" />
              {t("rewind:share.action")}
            </button>
          )}
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-13 items-center gap-2 rounded-full border border-current px-6 font-bold hover:bg-replay-ink/10"
          >
            <Icon icon="lucide:rotate-ccw" className="size-5" aria-hidden="true" />
            {t("rewind:outro.restart")}
          </button>
          <Link
            to="/"
            search={{ landing: "true" }}
            className="inline-flex min-h-13 items-center px-3 text-sm underline underline-offset-4"
          >
            {t("rewind:back")}
          </Link>
        </div>
        {shareState !== "idle" && (
          <p role="status" className="mt-3 text-sm">
            {shareState === "copied" ? t("common:linkCopied") : t("rewind:share.error")}
          </p>
        )}
        <details className="mt-8 max-w-2xl text-sm leading-relaxed">
          <summary className="min-h-11 cursor-pointer underline underline-offset-4">{t("rewind:method.title")}</summary>
          <p className="mt-2">{t("rewind:method.description", { year: REWIND_YEAR })}</p>
        </details>
      </div>
    </div>
  );
}

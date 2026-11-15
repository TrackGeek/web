import { Trans, useTranslation } from "react-i18next";
import { CONTENT_TYPE_LABELS } from "@/lib/content-types";
import type { GlobalRewind } from "@/types/rewind";
import { RewindMotif } from "./rewind-motif";

interface RewindGlobalProps {
  rewind?: GlobalRewind;
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}

export function RewindGlobal({ rewind, loading, failed, onRetry }: RewindGlobalProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="relative isolate flex min-h-full items-center overflow-clip bg-replay-blue text-replay-paper">
      <RewindMotif
        variant="flower"
        className="pointer-events-none absolute -right-52 -bottom-44 -z-10 size-168 text-replay-pink opacity-15 sm:size-220"
      />
      <div className="mx-auto w-full max-w-360 px-6 py-10 sm:px-12 lg:px-18">
        <h2 className="max-w-[16ch] text-4xl leading-none font-black text-balance sm:text-6xl">
          {t("rewind:global.title")}
        </h2>
        {loading && (
          <p role="status" className="mt-10 text-lg">
            {t("rewind:global.loading")}
          </p>
        )}
        {failed && (
          <div className="mt-8">
            <p role="alert" className="max-w-lg">
              {t("rewind:global.error")}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 min-h-12 rounded-full border border-current px-6 font-bold hover:bg-replay-paper/10"
            >
              {t("common:tryAgain")}
            </button>
          </div>
        )}
        {rewind && !failed && (
          <>
            <p className="mt-5 text-xl font-bold sm:text-2xl">
              <Trans
                i18nKey="rewind:global.count"
                count={rewind.tracked}
                components={{
                  value: (
                    <strong className="block text-[clamp(6rem,18vw,15rem)] leading-none font-black tabular-nums font-stretch-70%" />
                  ),
                }}
              />
            </p>
            <p className="mt-5 max-w-[42ch] text-base leading-relaxed">
              {t("rewind:global.people", {
                count: rewind.people,
                date: new Intl.DateTimeFormat(i18n.language, { day: "numeric", month: "long", timeZone: "UTC" }).format(
                  new Date(rewind.launchAt),
                ),
              })}
            </p>
            <div className="mt-6 flex max-w-3xl flex-wrap gap-x-5 gap-y-2 text-sm">
              {rewind.categories.map((category) => (
                <span key={category.type}>
                  {t("rewind:global.category", {
                    type: t(CONTENT_TYPE_LABELS[category.type]),
                    count: category.tracked,
                  })}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

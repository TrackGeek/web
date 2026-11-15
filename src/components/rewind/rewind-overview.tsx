import { Icon } from "@iconify/react";
import { Trans, useTranslation } from "react-i18next";
import { CONTENT_TYPE_ICONS, CONTENT_TYPE_LABELS } from "@/lib/content-types";
import type { PersonalRewind } from "@/types/rewind";
import { RewindMotif } from "./rewind-motif";

export function RewindOverview({ rewind }: { rewind: PersonalRewind }) {
  const { t } = useTranslation();

  return (
    <div className="relative isolate flex min-h-full items-center overflow-clip bg-replay-yellow text-replay-ink">
      <RewindMotif
        variant="flower"
        className="pointer-events-none absolute -right-32 -bottom-28 -z-10 size-128 text-replay-orange sm:size-192"
      />
      <div className="mx-auto w-full max-w-360 px-6 py-10 sm:px-12 lg:px-18">
        <h2 className="max-w-[16ch] text-4xl leading-none font-black text-balance sm:text-6xl">
          {t("rewind:overview.title")}
        </h2>
        <p className="mt-5 text-2xl font-bold sm:text-3xl">
          <Trans
            i18nKey="rewind:overview.count"
            count={rewind.tracked}
            components={{
              value: (
                <strong className="block text-[clamp(7rem,20vw,17rem)] leading-none font-black tabular-nums font-stretch-70%" />
              ),
            }}
          />
        </p>
        <ul className="mt-8 flex max-w-2xl flex-wrap gap-x-5 gap-y-3">
          {rewind.categories.map((category) => (
            <li key={category.type} className="flex items-center gap-2 text-sm font-medium sm:text-base">
              <Icon icon={CONTENT_TYPE_ICONS[category.type]} className="size-5" aria-hidden="true" />
              {t(CONTENT_TYPE_LABELS[category.type])}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { Trans, useTranslation } from "react-i18next";
import { REWIND_THEME, REWIND_YEAR } from "@/constants/rewind";
import type { RewindCategory as Category } from "@/types/rewind";
import { RewindMotif } from "./rewind-motif";

export function RewindCategory({ category }: { category: Category }) {
  const { t } = useTranslation();

  return (
    <div className={`relative isolate flex min-h-full items-center overflow-clip ${REWIND_THEME[category.type]}`}>
      <RewindMotif className="pointer-events-none absolute -right-52 -top-30 -z-10 w-140 -rotate-12 opacity-15 sm:w-220" />
      <div className="mx-auto w-full max-w-360 px-6 py-10 sm:px-12 lg:px-18">
        <h2 className="max-w-[20ch] text-4xl leading-none font-black text-balance sm:text-6xl">
          {t(`rewind:category.story.${category.type}`)}
        </h2>
        <p className="mt-6 text-2xl font-bold sm:text-3xl">
          <Trans
            i18nKey="rewind:category.count"
            count={category.tracked}
            values={{ type: t(`common:types.${category.type}`, { count: category.tracked }), year: REWIND_YEAR }}
            components={{
              value: (
                <strong className="block text-[clamp(7rem,20vw,17rem)] leading-none font-black tabular-nums font-stretch-70%" />
              ),
            }}
          />
        </p>
        <p className="mt-7 max-w-[40ch] text-base leading-relaxed">
          {t("rewind:category.completed", { count: category.completed })}
        </p>
      </div>
    </div>
  );
}

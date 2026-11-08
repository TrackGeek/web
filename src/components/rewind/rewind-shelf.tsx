import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { REWIND_THEME, REWIND_YEAR } from "@/constants/rewind";
import { CONTENT_TYPE_LABELS } from "@/lib/content-types";
import type { RewindCategory } from "@/types/rewind";
import { RewindTitleArt } from "./rewind-title-art";

export function RewindShelf({ category, favoriteBonus }: { category: RewindCategory; favoriteBonus: number }) {
  const { t, i18n } = useTranslation();
  const featured = category.titles[0];

  return (
    <div className={`flex min-h-full items-center ${REWIND_THEME[category.type]}`}>
      <div className="mx-auto w-full max-w-360 px-6 py-8 sm:px-12 lg:px-18">
        <h2 className="max-w-[20ch] text-3xl leading-none font-black text-balance sm:text-5xl">
          {t("rewind:shelf.title", { type: t(CONTENT_TYPE_LABELS[category.type]) })}
        </h2>
        <div className="mt-6 grid grid-cols-[minmax(0,0.6fr)_minmax(0,1fr)] items-start gap-5 sm:gap-12 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)]">
          {featured && <RewindTitleArt title={featured} type={category.type} className="w-full max-w-52 -rotate-3" />}
          <ol className="min-w-0 divide-y divide-current/20">
            {category.titles.map((title, index) => (
              <li key={title.id} className="flex min-w-0 gap-3 py-3 first:pt-0 sm:gap-5 sm:py-4">
                <span aria-hidden="true" className="text-xl font-black tabular-nums sm:text-3xl">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  {title.slug ? (
                    <Link
                      to={`/${category.type}/$slug`}
                      params={{ slug: title.slug }}
                      title={title.title ?? undefined}
                      className="line-clamp-2 text-sm leading-snug font-bold underline decoration-current/30 underline-offset-4 hover:decoration-current sm:line-clamp-1 sm:text-xl"
                    >
                      {title.title ?? t("rewind:untitled")}
                    </Link>
                  ) : (
                    <p className="line-clamp-2 text-sm font-bold sm:text-xl">{title.title ?? t("rewind:untitled")}</p>
                  )}
                  <p className="mt-1 text-xs">
                    {new Intl.DateTimeFormat(i18n.language, { day: "numeric", month: "short", timeZone: "UTC" }).format(
                      new Date(title.recordedAt),
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        {!featured && <p className="mt-6 max-w-prose text-lg">{t("rewind:shelf.empty", { year: REWIND_YEAR })}</p>}
        <p className="mt-6 max-w-prose text-sm">
          {t("rewind:shelf.description", { year: REWIND_YEAR, bonus: favoriteBonus })}
        </p>
      </div>
    </div>
  );
}

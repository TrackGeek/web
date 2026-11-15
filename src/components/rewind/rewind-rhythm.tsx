import { useTranslation } from "react-i18next";
import type { PersonalRewind } from "@/types/rewind";

export function RewindRhythm({ monthly }: { monthly: PersonalRewind["monthly"] }) {
  const { t, i18n } = useTranslation();
  const peak = monthly.reduce((best, month) => (month.count > best.count ? month : best), monthly[0]);
  const monthName = (month: number, style: "long" | "short") =>
    new Intl.DateTimeFormat(i18n.language, { month: style, timeZone: "UTC" }).format(
      new Date(Date.UTC(2026, month, 1)),
    );

  return (
    <div className="flex min-h-full items-center bg-replay-mint text-replay-ink">
      <div className="mx-auto w-full max-w-360 px-6 py-10 sm:px-12 lg:px-18">
        <h2 className="max-w-[18ch] text-4xl leading-none font-black text-balance sm:text-6xl">
          {t("rewind:rhythm.title", { month: monthName(peak.month, "long") })}
        </h2>
        <dl className="mt-8 grid grid-cols-6 items-end gap-x-2 gap-y-6 sm:mt-12 sm:grid-cols-12 sm:gap-3">
          {monthly.map(({ month, count }) => (
            <div key={month} className="min-w-0 text-center">
              <dd className="flex h-24 flex-col justify-end sm:h-52">
                <span className="mb-1 text-xs font-bold tabular-nums" aria-hidden="true">
                  {count ? new Intl.NumberFormat(i18n.language).format(count) : ""}
                </span>
                <span className="sr-only">{t("common:titleCount", { count })}</span>
                <span
                  aria-hidden="true"
                  className={`block h-18 origin-bottom rounded-t-full sm:h-44 ${month === peak.month ? "bg-replay-blue" : "bg-replay-ink"}`}
                  style={{
                    transform: `scaleY(${Math.max(0.008, count / Math.max(1, peak.count))})`,
                    marginTop: "auto",
                  }}
                />
              </dd>
              <dt className="mt-3 truncate text-xs font-medium">{monthName(month, "short")}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-7 max-w-xl text-sm leading-relaxed">{t("rewind:rhythm.description")}</p>
      </div>
    </div>
  );
}

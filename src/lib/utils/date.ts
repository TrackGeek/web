import type { TFunction } from "i18next";

const SEASON_KEYS = ["winter", "spring", "summer", "fall"] as const;

type DateInput = string | number | Date | null | undefined;

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatLongDate(value: DateInput, locale: string): string | null {
  const date = toDate(value);
  if (!date) return null;

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
  ["second", 1],
];

export function formatRelativeTime(value: DateInput, locale: string): string | null {
  const date = toDate(value);
  if (!date) return null;

  const seconds = (date.getTime() - Date.now()) / 1000;
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  for (const [unit, secondsInUnit] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= secondsInUnit) return formatter.format(Math.round(seconds / secondsInUnit), unit);
  }

  return formatter.format(0, "second");
}

export function formatDateRange(from: DateInput, to: DateInput, locale: string, t: TFunction): string | null {
  const start = formatLongDate(from, locale);
  if (!start) return null;

  const end = formatLongDate(to, locale);
  return `${start} – ${end ?? t("library:present")}`;
}

export function formatSeason(
  season: string | null | undefined,
  year: number | string | null | undefined,
  t: TFunction,
) {
  if (!season) return year ? String(year) : null;

  const key = season.toLowerCase();
  const label = SEASON_KEYS.includes(key as (typeof SEASON_KEYS)[number]) ? t(`library:seasons.${key}`) : season;
  return year ? `${label} ${year}` : label;
}

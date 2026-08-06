import { useTranslation } from "react-i18next";
import type { ContentType } from "@/components/layouts/filters.tsx";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

/**
 * Values must match what the search endpoints accept: `TenraiAnimeStatus`, `AnilistMangaStatus`
 * and the raw IGDB `game_status.status` strings. Movies, TV shows and books are omitted because
 * their providers expose no status filter on search.
 */
const STATUS_OPTIONS: Partial<Record<ContentType, { value: string; labelKey: string }[]>> = {
  anime: [
    { value: "upcoming", labelKey: "library:statusAir.notYetAired" },
    { value: "airing", labelKey: "library:statusAir.currentlyAiring" },
    { value: "complete", labelKey: "library:statusAir.finishedAiring" },
  ],
  manga: [
    { value: "upcoming", labelKey: "library:statusAir.notYetPublished" },
    { value: "publishing", labelKey: "library:statusAir.publishing" },
    { value: "complete", labelKey: "library:statusAir.finished" },
    { value: "hiatus", labelKey: "library:statusAir.onHiatus" },
    { value: "discontinued", labelKey: "library:statusAir.discontinued" },
  ],
  game: [
    { value: "Released", labelKey: "library:statusAir.released" },
    { value: "Not Released", labelKey: "library:statusAir.unreleased" },
    { value: "Early Access", labelKey: "library:statusAir.earlyAccess" },
    { value: "Alpha", labelKey: "library:statusAir.alpha" },
    { value: "Beta", labelKey: "library:statusAir.beta" },
    { value: "Delisted", labelKey: "library:statusAir.delisted" },
    { value: "Offline", labelKey: "library:statusAir.offline" },
    { value: "Cancelled", labelKey: "library:statusAir.cancelled" },
    { value: "Rumored", labelKey: "library:statusAir.rumored" },
  ],
};

const CLEAR_VALUE = "__clear__";

export function hasStatusFilter(type: ContentType) {
  return !!STATUS_OPTIONS[type];
}

interface StatusProps {
  type: ContentType;
  value?: string;
  onChange?: (value: string | undefined) => void;
}

export function Status({ type, value, onChange }: StatusProps) {
  const { t } = useTranslation();

  const options = STATUS_OPTIONS[type];

  if (!options) return null;

  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:status")}</h5>
      <Select value={value ?? CLEAR_VALUE} onValueChange={(v) => onChange?.(v === CLEAR_VALUE ? undefined : v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("library:status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={CLEAR_VALUE}>{t("common:all")}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

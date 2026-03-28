import { useTranslation } from "react-i18next";
import type { ContentType } from "@/components/layouts/filters.tsx";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

const STATUS_OPTIONS: Record<ContentType, { value: string; labelKey: string }[]> = {
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
  book: [
    { value: "released", labelKey: "library:statusAir.released" },
    { value: "unreleased", labelKey: "library:statusAir.unreleased" },
  ],
  game: [
    { value: "released", labelKey: "library:statusAir.released" },
    { value: "unreleased", labelKey: "library:statusAir.unreleased" },
  ],
  movie: [
    { value: "released", labelKey: "library:statusAir.released" },
    { value: "unreleased", labelKey: "library:statusAir.unreleased" },
  ],
  tv: [
    { value: "notYetAired", labelKey: "library:statusAir.notYetAired" },
    { value: "currentlyAiring", labelKey: "library:statusAir.currentlyAiring" },
    { value: "finishedAiring", labelKey: "library:statusAir.finishedAiring" },
  ],
};

const CLEAR_VALUE = "__clear__";

interface StatusProps {
  type: ContentType;
  value?: string;
  onChange?: (value: string | undefined) => void;
}

export function Status({ type, value, onChange }: StatusProps) {
  const { t } = useTranslation();

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
            {STATUS_OPTIONS[type].map((option) => (
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

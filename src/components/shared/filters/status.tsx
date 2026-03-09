import { useTranslation } from "react-i18next";
import type { ContentType } from "@/components/layouts/filters.tsx";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

const STATUS_OPTIONS: Record<ContentType, { value: string; labelKey: string }[]> = {
  anime: [
    { value: "notYetAired", labelKey: "library:statusAir.notYetAired" },
    { value: "currentlyAiring", labelKey: "library:statusAir.currentlyAiring" },
    { value: "finishedAiring", labelKey: "library:statusAir.finishedAiring" },
  ],
  manga: [
    { value: "notYetPublished", labelKey: "library:statusAir.notYetPublished" },
    { value: "publishing", labelKey: "library:statusAir.publishing" },
    { value: "finished", labelKey: "library:statusAir.finished" },
    { value: "onHiatus", labelKey: "library:statusAir.onHiatus" },
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

export function Status({ type }: { type: ContentType }) {
  const { t } = useTranslation();

  const currentStatus = STATUS_OPTIONS[type];

  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:status")}</h5>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("library:status")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {currentStatus.map((option) => (
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

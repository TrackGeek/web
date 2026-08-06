import { useTranslation } from "react-i18next";
import type { ContentType } from "@/components/layouts/filters.tsx";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

/** Values must match each provider's `orderBy` enum on the API, which validates them strictly. */
const SORT_OPTIONS: Record<ContentType, { value: string; labelKey: string }[]> = {
  anime: [
    { value: "score", labelKey: "user:sort.rating" },
    { value: "title", labelKey: "user:sort.title" },
    { value: "start_date", labelKey: "user:sort.releaseDate" },
    { value: "end_date", labelKey: "user:sort.endDate" },
    { value: "type", labelKey: "library:type" },
  ],
  manga: [
    { value: "score", labelKey: "user:sort.rating" },
    { value: "title", labelKey: "user:sort.title" },
    { value: "start_date", labelKey: "user:sort.releaseDate" },
    { value: "end_date", labelKey: "user:sort.endDate" },
    { value: "popularity", labelKey: "user:sort.popularity" },
  ],
  game: [
    { value: "popularity", labelKey: "user:sort.popularity" },
    { value: "total_rating", labelKey: "user:sort.rating" },
    { value: "name", labelKey: "user:sort.title" },
    { value: "first_release_date", labelKey: "user:sort.releaseDate" },
  ],
  movie: [
    { value: "score", labelKey: "user:sort.rating" },
    { value: "title", labelKey: "user:sort.title" },
    { value: "release_date", labelKey: "user:sort.releaseDate" },
  ],
  tv: [
    { value: "score", labelKey: "user:sort.rating" },
    { value: "name", labelKey: "user:sort.title" },
    { value: "first_air_date", labelKey: "user:sort.releaseDate" },
  ],
  book: [
    { value: "rating", labelKey: "user:sort.rating" },
    { value: "title", labelKey: "user:sort.title" },
    { value: "release_date", labelKey: "user:sort.releaseDate" },
  ],
};

const CLEAR_VALUE = "__clear__";

interface SortProps {
  type: ContentType;
  value?: string;
  onChange?: (value: string | undefined) => void;
}

export function Sort({ type, value, onChange }: SortProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">{t("user:sort.placeholder")}</h5>
      <Select value={value ?? CLEAR_VALUE} onValueChange={(v) => onChange?.(v === CLEAR_VALUE ? undefined : v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("user:sort.placeholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={CLEAR_VALUE}>{t("common:all")}</SelectItem>
            {SORT_OPTIONS[type].map((option) => (
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

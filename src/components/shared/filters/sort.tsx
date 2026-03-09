import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

const SORT_OPTIONS = [
  { value: "title", labelKey: "user:sort.title" },
  { value: "lastAdded", labelKey: "user:sort.lastAdded" },
  { value: "lastUpdated", labelKey: "user:sort.lastUpdated" },
  { value: "rating", labelKey: "user:sort.rating" },
  { value: "releaseDate", labelKey: "user:sort.releaseDate" },
  { value: "popularity", labelKey: "user:sort.popularity" },
];

export function Sort() {
  const { t } = useTranslation();

  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">{t("user:sort.placeholder")}</h5>
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("user:sort.placeholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {SORT_OPTIONS.map((option) => (
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

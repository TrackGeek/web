import { useTranslation } from "react-i18next";
import type { ContentType } from "@/components/layouts/filters.tsx";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

/** Values must match the API enums (`TenraiAnimeType`, `AnilistMangaType`). */
const TYPE_OPTIONS: Partial<Record<ContentType, { value: string; labelKey?: string; label?: string }[]>> = {
  anime: [
    { value: "tv", labelKey: "common:types.tv" },
    { value: "movie", labelKey: "common:types.movie" },
    { value: "ova", label: "OVA" },
    { value: "ona", label: "ONA" },
    { value: "special", labelKey: "library:types.Special" },
    { value: "tv_special", labelKey: "library:types.TVSpecial" },
    { value: "music", labelKey: "library:types.Music" },
    { value: "cm", label: "CM" },
    { value: "pv", label: "PV" },
  ],
  manga: [
    { value: "manga", labelKey: "common:types.manga" },
    { value: "novel", labelKey: "library:types.Novel" },
    { value: "lightnovel", labelKey: "library:types.LightNovel" },
    { value: "oneshot", labelKey: "library:types.OneShot" },
    { value: "doujin", labelKey: "library:types.Doujinshi" },
    { value: "manhwa", labelKey: "library:types.Manhwa" },
    { value: "manhua", labelKey: "library:types.Manhua" },
  ],
};

const CLEAR_VALUE = "__clear__";

export function hasTypeFilter(type: ContentType) {
  return !!TYPE_OPTIONS[type];
}

interface TypeProps {
  type: ContentType;
  value?: string;
  onChange?: (value: string | undefined) => void;
}

export function Type({ type, value, onChange }: TypeProps) {
  const { t } = useTranslation();

  const options = TYPE_OPTIONS[type];

  if (!options) return null;

  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:type")}</h5>
      <Select value={value ?? CLEAR_VALUE} onValueChange={(v) => onChange?.(v === CLEAR_VALUE ? undefined : v)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("library:type")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={CLEAR_VALUE}>{t("common:all")}</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.labelKey ? t(option.labelKey) : option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

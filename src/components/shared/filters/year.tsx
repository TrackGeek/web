import { useTranslation } from "react-i18next";
import type { ContentType } from "@/components/layouts/filters.tsx";
import { Input } from "@/components/ui/input.tsx";

const YEAR_RANGES: Record<ContentType, { min: number; max: number }> = {
  anime: { min: 1958, max: new Date().getFullYear() + 2 },
  manga: { min: 1858, max: new Date().getFullYear() + 2 },
  book: { min: -3000, max: new Date().getFullYear() },
  game: { min: 1958, max: new Date().getFullYear() + 2 },
  movie: { min: 1888, max: new Date().getFullYear() + 2 },
  tv: { min: 1927, max: new Date().getFullYear() + 2 },
};

export function Year({ type }: { type: ContentType }) {
  const { t } = useTranslation();

  const yearRange = YEAR_RANGES[type];

  return (
    <div>
      <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:year")}</h5>
      <Input
        type="number"
        placeholder={t("library:year")}
        min={yearRange.min}
        max={yearRange.max}
        className="bg-muted/50"
      />
    </div>
  );
}

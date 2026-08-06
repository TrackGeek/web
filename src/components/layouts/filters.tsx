import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { GameModes } from "@/components/shared/filters/game-modes.tsx";
import { Genres } from "@/components/shared/filters/genre.tsx";
import { Platforms } from "@/components/shared/filters/platforms.tsx";
import { Rating } from "@/components/shared/filters/rating.tsx";
import { Sort } from "@/components/shared/filters/sort.tsx";
import { hasStatusFilter, Status } from "@/components/shared/filters/status.tsx";
import { hasTypeFilter, Type } from "@/components/shared/filters/type.tsx";
import { Year } from "@/components/shared/filters/year.tsx";
import { Button } from "@/components/ui/button.tsx";

export type ContentType = "anime" | "manga" | "book" | "game" | "movie" | "tv";

export type FilterParams = {
  status?: string;
  type?: string;
  genres?: string[];
  year?: string;
  sort?: string;
  gameMode?: string;
  platforms?: string[];
  minTgScore?: number;
};

export const EMPTY_FILTERS: FilterParams = {};

export function countActiveFilters(filters: FilterParams) {
  return Object.values(filters).filter((value) => (Array.isArray(value) ? value.length > 0 : value != null)).length;
}

interface FiltersProps {
  type: ContentType;
  values: FilterParams;
  onChange: (patch: Partial<FilterParams>) => void;
  onClear: () => void;
}

export function Filters({ type, values, onChange, onClear }: FiltersProps) {
  const { t } = useTranslation();

  const activeCount = countActiveFilters(values);

  return (
    <div className="w-full md:w-1/4 flex flex-col gap-6">
      <div className="bg-card rounded-2xl shadow-lg p-6 gap-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h5 className="text-md font-semibold text-card-foreground">{t("user:filter")}</h5>

          {activeCount > 0 && (
            <Button variant="ghost" size="sm" className="cursor-pointer h-7 px-2" onClick={onClear}>
              <Icon icon="lucide:x" className="size-4" aria-hidden="true" />
              {t("common:clear")}
            </Button>
          )}
        </div>

        <Rating value={values.minTgScore} onChange={(v) => onChange({ minTgScore: v })} />

        {hasTypeFilter(type) && <Type type={type} value={values.type} onChange={(v) => onChange({ type: v })} />}

        {hasStatusFilter(type) && (
          <Status type={type} value={values.status} onChange={(v) => onChange({ status: v })} />
        )}

        <Genres type={type} value={values.genres} onChange={(v) => onChange({ genres: v })} />

        <Year type={type} value={values.year} onChange={(v) => onChange({ year: v })} />

        {type === "game" && (
          <>
            <Platforms value={values.platforms} onChange={(v) => onChange({ platforms: v })} />
            <GameModes value={values.gameMode} onChange={(v) => onChange({ gameMode: v })} />
          </>
        )}

        <Sort type={type} value={values.sort} onChange={(v) => onChange({ sort: v })} />
      </div>
    </div>
  );
}

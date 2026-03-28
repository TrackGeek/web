import { useTranslation } from "react-i18next";
import { GameModes } from "@/components/shared/filters/game-modes.tsx";
import { Genres } from "@/components/shared/filters/genre.tsx"; // import { MinEpisodes } from "@/components/shared/filters/min-episodes.tsx";
// import { MinReading } from "@/components/shared/filters/min-reading.tsx";
import { Sort } from "@/components/shared/filters/sort.tsx";
import { Status } from "@/components/shared/filters/status.tsx";
import { Year } from "@/components/shared/filters/year.tsx";

export type ContentType = "anime" | "manga" | "book" | "game" | "movie" | "tv";

export type FilterParams = {
  status?: string;
  genres?: string[];
  year?: string;
  sort?: string;
  gameModes?: string[];
  platforms?: string[];
  minEpisodes?: number;
  minReading?: number;
};

interface FiltersProps {
  type: ContentType;
  values: FilterParams;
  onChange: (patch: Partial<FilterParams>) => void;
}

export function Filters({ type, values, onChange }: FiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full md:w-1/4 flex flex-col gap-6">
      <div className="bg-card rounded-2xl shadow-lg p-6 gap-4 flex flex-col">
        <h5 className="text-md font-semibold text-card-foreground">{t("user:filter")}</h5>

        <Status type={type} value={values.status} onChange={(v) => onChange({ status: v })} />

        <Genres type={type} value={values.genres} onChange={(v) => onChange({ genres: v })} />

        <Year type={type} value={values.year} onChange={(v) => onChange({ year: v })} />

        <Sort value={values.sort} onChange={(v) => onChange({ sort: v })} />

        {type === "game" && (
          <GameModes value={values.gameModes} platforms={values.platforms} onChange={(v) => onChange(v)} />
        )}

        {/*(type === "anime" || type === "tv") && (
          <MinEpisodes value={values.minEpisodes} onChange={(v) => onChange({ minEpisodes: v })} />
        ) */}

        {/*(type === "manga" || type === "book") && (
          <MinReading type={type} value={values.minReading} onChange={(v) => onChange({ minReading: v })} />
        )*/}
      </div>
    </div>
  );
}

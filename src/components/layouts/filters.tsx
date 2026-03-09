import { useTranslation } from "react-i18next";
import { GameModes } from "@/components/shared/filters/game-modes.tsx";
import { Genres } from "@/components/shared/filters/genre.tsx";
import { MinEpisodes } from "@/components/shared/filters/min-episodes.tsx";
import { MinReading } from "@/components/shared/filters/min-reading.tsx";
import { Sort } from "@/components/shared/filters/sort.tsx";
import { Status } from "@/components/shared/filters/status.tsx";
import { Year } from "@/components/shared/filters/year.tsx";

export type ContentType = "anime" | "manga" | "book" | "game" | "movie" | "tv";

export function Filters({ type }: { type: ContentType }) {
  const { t } = useTranslation();

  return (
    <div className="w-full md:w-1/4 flex flex-col gap-6">
      <div className="bg-card rounded-2xl shadow-lg p-6 gap-4 flex flex-col">
        <h5 className="text-md font-semibold text-card-foreground">{t("user:filter")}</h5>

        <Status type={type} />

        <Genres type={type} />

        <Year type={type} />

        <Sort />

        {type === "game" && <GameModes />}

        {(type === "anime" || type === "tv") && <MinEpisodes />}

        {(type === "manga" || type === "book") && <MinReading type={type} />}
      </div>
    </div>
  );
}

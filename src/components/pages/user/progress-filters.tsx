import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox.tsx";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProgressFilters } from "@/hooks/progress";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";
import { getGenreLabel, isKnownGenre } from "@/lib/utils/genre-utils.ts";

/** Each provider names the same state differently, so labels are picked per content type. */
const RELEASE_STATE_LABELS: Record<ApiTypes.ReviewContentType, Partial<Record<ApiTypes.MediaReleaseState, string>>> = {
  anime: {
    Ongoing: "library:statusAir.currentlyAiring",
    Finished: "library:statusAir.finishedAiring",
    Hiatus: "library:statusAir.onHiatus",
    Unreleased: "library:statusAir.notYetAired",
    Cancelled: "library:statusAir.discontinued",
  },
  tv: {
    Ongoing: "library:statusAir.currentlyAiring",
    Finished: "library:statusAir.finishedAiring",
    Hiatus: "library:statusAir.onHiatus",
    Unreleased: "library:statusAir.notYetAired",
    Cancelled: "library:statusAir.discontinued",
  },
  manga: {
    Ongoing: "library:statusAir.publishing",
    Finished: "library:statusAir.finished",
    Hiatus: "library:statusAir.onHiatus",
    Unreleased: "library:statusAir.notYetPublished",
    Cancelled: "library:statusAir.discontinued",
  },
  book: {
    Finished: "library:statusAir.released",
    Unreleased: "library:statusAir.unreleased",
  },
  movie: {},
  game: {
    Ongoing: "library:statusAir.earlyAccess",
    Cancelled: "library:statusAir.discontinued",
  },
};

interface ProgressFiltersPanelProps {
  contentType: ApiTypes.ReviewContentType;
  options?: ApiTypes.ProgressFilterOptions;
  isLoading: boolean;
  value: ProgressFilters;
  onChange: (patch: Partial<ProgressFilters>) => void;
}

export function ProgressFiltersPanel({ contentType, options, isLoading, value, onChange }: ProgressFiltersPanelProps) {
  const { t } = useTranslation();
  const [genreSearch, setGenreSearch] = useState("");

  // Hardcover ships free-form tags instead of genres, so only recognized ones are offered.
  const genreOptions = useMemo(() => {
    const genres = options?.genres ?? [];

    return contentType === "book" ? genres.filter((genre) => isKnownGenre(t, genre)) : genres;
  }, [contentType, options?.genres, t]);

  const visibleGenres = useMemo(() => {
    const query = genreSearch.trim().toLowerCase();

    if (!query) return genreOptions;

    return genreOptions.filter((genre) => getGenreLabel(t, genre).toLowerCase().includes(query));
  }, [genreOptions, genreSearch, t]);

  const years = options?.years ?? [];
  const releaseStates = options?.releaseStates ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {genreOptions.length > 0 && (
        <FilterGroup label={""}>
          <Combobox
            items={visibleGenres}
            multiple
            value={value.genres}
            onValueChange={(genres: string[]) => onChange({ genres })}
          >
            <ComboboxInput
              placeholder={t("library:genres")}
              showClear
              className="bg-muted/50"
              value={genreSearch}
              onChange={(event) => setGenreSearch(event.target.value)}
            />
            <ComboboxContent>
              <ComboboxList>
                {visibleGenres.map((genre) => (
                  <ComboboxItem key={genre} value={genre}>
                    {getGenreLabel(t, genre)}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </FilterGroup>
      )}

      {years.length > 0 && (
        <FilterGroup label={""}>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={t("library:year")}
            className="bg-muted/50"
            min={Math.min(...years)}
            max={Math.max(...years)}
            value={value.year}
            onChange={(event) => onChange({ year: event.target.value })}
          />
        </FilterGroup>
      )}

      <FilterGroup label={t("library:availability")}>
        <FilterChips>
          <FilterChip selected={value.released === null} onClick={() => onChange({ released: null })}>
            {t("common:all")}
          </FilterChip>
          <FilterChip selected={value.released === true} onClick={() => onChange({ released: true })}>
            {t("library:statusAir.released")}
          </FilterChip>
          <FilterChip selected={value.released === false} onClick={() => onChange({ released: false })}>
            {t("library:statusAir.unreleased")}
          </FilterChip>
        </FilterChips>
      </FilterGroup>

      {releaseStates.length > 1 && (
        <FilterGroup label={t("library:status")}>
          <FilterChips>
            {releaseStates.map((state) => {
              const labelKey = RELEASE_STATE_LABELS[contentType][state];
              const selected = value.releaseStates.includes(state);

              if (!labelKey) return null;

              return (
                <FilterChip
                  key={state}
                  selected={selected}
                  onClick={() =>
                    onChange({
                      releaseStates: selected
                        ? value.releaseStates.filter((item) => item !== state)
                        : [...value.releaseStates, state],
                    })
                  }
                >
                  {t(labelKey)}
                </FilterChip>
              );
            })}
          </FilterChips>
        </FilterGroup>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground/70">{label}</span>
      {children}
    </div>
  );
}

function FilterChips({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-1">{children}</div>;
}

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap bg-muted/30 cursor-pointer",
        selected ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

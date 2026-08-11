import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useContentTypes } from "@/hooks/content-type";
import { cn } from "@/lib/utils";
import { CreditCard } from "./credit-card";
import type { PersonCredit, PersonCreditMediaType } from "./types";

const PAGE_SIZE = 24;

type MediaFilter = "all" | PersonCreditMediaType;
type RoleFilter = "all" | "cast" | "crew";
type SortOrder = "newest" | "oldest" | "rating";

function FilterChip({
  isActive,
  count,
  className,
  onClick,
  children,
}: {
  isActive: boolean;
  count?: number;
  className?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={isActive ? "default" : "outline"}
      size="sm"
      aria-pressed={isActive}
      onClick={onClick}
      className={cn("rounded-full", !isActive && "text-muted-foreground", className)}
    >
      {children}
      {count !== undefined && (
        <span className={cn("tabular-nums", isActive ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
          {count}
        </span>
      )}
    </Button>
  );
}

export function CreditsSection({ credits: allCredits, heading }: { credits: PersonCredit[]; heading?: string }) {
  const { t } = useTranslation();
  const { isVisible, hiddenClass } = useContentTypes();
  const [media, setMedia] = useState<MediaFilter>("all");
  const [role, setRole] = useState<RoleFilter>("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  const credits = useMemo(() => allCredits.filter((credit) => isVisible(credit.mediaType)), [allCredits, isVisible]);

  useEffect(() => {
    if (media === "all" || isVisible(media)) return;

    setMedia("all");
  }, [media, isVisible]);

  const counts = useMemo(
    () => ({
      all: credits.length,
      movie: credits.filter((credit) => credit.mediaType === "movie").length,
      tv: credits.filter((credit) => credit.mediaType === "tv").length,
      anime: credits.filter((credit) => credit.mediaType === "anime").length,
      manga: credits.filter((credit) => credit.mediaType === "manga").length,
      cast: credits.filter((credit) => credit.isCast).length,
      crew: credits.filter((credit) => !credit.isCast).length,
    }),
    [credits],
  );

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    const matching = credits.filter((credit) => {
      if (media !== "all" && credit.mediaType !== media) {
        return false;
      }

      if (role === "cast" && !credit.isCast) {
        return false;
      }

      if (role === "crew" && credit.isCast) {
        return false;
      }

      if (!search) {
        return true;
      }

      return (
        credit.title.toLowerCase().includes(search) ||
        credit.roles.some((entry) => entry.toLowerCase().includes(search))
      );
    });

    return [...matching].sort((a, b) => {
      if (sort === "rating") {
        return (b.externalReviewScore ?? 0) - (a.externalReviewScore ?? 0);
      }

      const direction = sort === "oldest" ? -1 : 1;

      return ((b.year ?? 0) - (a.year ?? 0)) * direction;
    });
  }, [credits, media, role, sort, query]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && visibleRef.current < filtered.length) {
          setVisible((current) => current + PAGE_SIZE);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [filtered.length]);

  const resetPaging =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setVisible(PAGE_SIZE);
    };

  const mediaFilters: { value: MediaFilter; label: string; count: number }[] = [
    { value: "all", label: t("common:all"), count: counts.all },
    { value: "movie", label: t("common:types.movie", { count: 2 }), count: counts.movie },
    { value: "tv", label: t("common:types.tv", { count: 2 }), count: counts.tv },
    { value: "anime", label: t("common:types.anime", { count: 2 }), count: counts.anime },
    { value: "manga", label: t("common:types.manga", { count: 2 }), count: counts.manga },
  ];

  const roleFilters: { value: RoleFilter; label: string; count: number }[] = [
    { value: "all", label: t("common:all"), count: counts.all },
    { value: "cast", label: t("library:cast"), count: counts.cast },
    { value: "crew", label: t("library:crew"), count: counts.crew },
  ];

  const sortOptions: { value: SortOrder; label: string; icon: string }[] = [
    { value: "newest", label: t("library:newestFirst"), icon: "lucide:arrow-down-wide-narrow" },
    { value: "oldest", label: t("library:oldestFirst"), icon: "lucide:arrow-up-wide-narrow" },
    { value: "rating", label: t("library:topRated"), icon: "lucide:star" },
  ];

  return (
    <section className="space-y-4" aria-labelledby="filmography-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="filmography-heading" className="font-bold text-2xl text-card-foreground">
          {heading ?? t("library:filmography")}
        </h2>

        <div className="relative w-full sm:w-64">
          <Icon
            icon="lucide:search"
            className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => resetPaging(setQuery)(event.target.value)}
            placeholder={t("library:searchCredits")}
            aria-label={t("library:searchCredits")}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 sm:flex-wrap sm:overflow-visible sm:justify-between sm:items-center">
          {mediaFilters.filter((filter) => filter.count > 0).length > 2 && (
            <fieldset className="flex gap-2">
              <legend className="sr-only">{t("library:mediaType")}</legend>
              {mediaFilters
                .filter((filter) => filter.value === "all" || filter.count > 0)
                .map((filter) => (
                  <FilterChip
                    key={filter.value}
                    isActive={media === filter.value}
                    count={filter.count}
                    className={filter.value === "all" ? undefined : hiddenClass(filter.value)}
                    onClick={() => resetPaging(setMedia)(filter.value)}
                  >
                    {filter.label}
                  </FilterChip>
                ))}
            </fieldset>
          )}
          {counts.cast > 0 && counts.crew > 0 && (
            <fieldset className="flex gap-2">
              <legend className="sr-only">{t("library:role")}</legend>
              {roleFilters.map((filter) => (
                <FilterChip
                  key={filter.value}
                  isActive={role === filter.value}
                  count={filter.count}
                  onClick={() => resetPaging(setRole)(filter.value)}
                >
                  {filter.label}
                </FilterChip>
              ))}
            </fieldset>
          )}

          <fieldset className="flex gap-2">
            <legend className="sr-only">{t("library:sortBy")}</legend>
            {sortOptions.map((option) => (
              <FilterChip key={option.value} isActive={sort === option.value} onClick={() => setSort(option.value)}>
                <Icon icon={option.icon} aria-hidden="true" />
                {option.label}
              </FilterChip>
            ))}
          </fieldset>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="lucide:film" />
            </EmptyMedia>
            <EmptyTitle>{t("library:noCreditsFound")}</EmptyTitle>
            <EmptyDescription>{t("library:noCreditsFoundDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Grid minColSize={"140px"} className="gap-4">
            {filtered.slice(0, visible).map((credit) => (
              <CreditCard key={credit.key} credit={credit} />
            ))}
          </Grid>

          {visible < filtered.length && <div ref={sentinelRef} className="h-px" />}
        </>
      )}
    </section>
  );
}

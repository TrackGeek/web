import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { CompanyMediaType, CompanyWork } from "./types";
import { WorkCard } from "./work-card";

const PAGE_SIZE = 24;

type SortOrder = "newest" | "oldest" | "rating";

function FilterChip({
  isActive,
  count,
  onClick,
  children,
}: {
  isActive: boolean;
  count?: number;
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
      className={cn("rounded-full", !isActive && "text-muted-foreground")}
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

export function WorksSection({ mediaType, works }: { mediaType: CompanyMediaType; works: CompanyWork[] }) {
  const { t } = useTranslation();
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  const roleFilters = useMemo(() => {
    const counts = new Map<string, number>();

    for (const work of works) {
      for (const entry of work.roles) {
        counts.set(entry, (counts.get(entry) ?? 0) + 1);
      }
    }

    return [
      { value: "all", label: t("common:all"), count: works.length },
      ...[...counts.entries()].map(([value, count]) => ({ value, label: value, count })),
    ];
  }, [works, t]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    const matching = works.filter((work) => {
      if (role !== "all" && !work.roles.includes(role)) {
        return false;
      }

      return !search || work.title.toLowerCase().includes(search);
    });

    return [...matching].sort((a, b) => {
      if (sort === "rating") {
        return (b.externalReviewScore ?? 0) - (a.externalReviewScore ?? 0);
      }

      const direction = sort === "oldest" ? -1 : 1;

      return ((b.year ?? 0) - (a.year ?? 0)) * direction;
    });
  }, [works, role, sort, query]);

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

  const sortOptions: { value: SortOrder; label: string; icon: string }[] = [
    { value: "newest", label: t("library:newestFirst"), icon: "lucide:arrow-down-wide-narrow" },
    { value: "oldest", label: t("library:oldestFirst"), icon: "lucide:arrow-up-wide-narrow" },
    { value: "rating", label: t("library:topRated"), icon: "lucide:star" },
  ];

  return (
    <section className="space-y-4" aria-labelledby="catalog-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="catalog-heading" className="font-bold text-2xl text-card-foreground">
          {t("library:catalog")}
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
            placeholder={t("library:searchTitles")}
            aria-label={t("library:searchTitles")}
            className="pl-9"
          />
        </div>
      </div>

      <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 sm:flex-wrap sm:items-center sm:justify-between sm:overflow-visible">
        {roleFilters.length > 2 && (
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

      {filtered.length === 0 ? (
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="lucide:building" />
            </EmptyMedia>
            <EmptyTitle>{t("library:noTitlesFound")}</EmptyTitle>
            <EmptyDescription>{t("library:noTitlesFoundDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <Grid minColSize={"140px"} className="gap-4">
            {filtered.slice(0, visible).map((work) => (
              <WorkCard key={work.key} mediaType={mediaType} work={work} />
            ))}
          </Grid>

          {visible < filtered.length && <div ref={sentinelRef} className="h-px" />}
        </>
      )}
    </section>
  );
}

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import type { FavoriteItem } from "@/components/pages/user/overview-tab/favorite-card";
import { ProgressFiltersPanel } from "@/components/pages/user/progress-filters";
import { CardItem } from "@/components/shared/cards/card";
import { SearchInput } from "@/components/shared/search-input";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  countActiveFilters,
  DEFAULT_PROGRESS_SORT,
  EMPTY_PROGRESS_FILTERS,
  fetchRandomProgress,
  PROGRESS_CONTENT,
  type ProgressFilters,
  type ProgressSort,
  progressSortOptions,
  progressStatusSections,
  progressToItem,
  useProgressFilterOptions,
  useUserProgress,
} from "@/hooks/progress";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/utils/useDebounce";

const CONTENT_TYPES: { type: ApiTypes.ReviewContentType; labelKey: string; icon: string }[] = [
  { type: "movie", labelKey: "common:types.movie_other", icon: "lucide:clapperboard" },
  { type: "tv", labelKey: "common:types.tv_other", icon: "lucide:tv" },
  { type: "game", labelKey: "common:types.game_other", icon: "lucide:gamepad-2" },
  { type: "anime", labelKey: "common:types.anime_other", icon: "lucide:mountain" },
  { type: "manga", labelKey: "common:types.manga_other", icon: "lucide:book-open" },
  { type: "book", labelKey: "common:types.book_other", icon: "lucide:book" },
];

const SECTION_ICONS: Partial<Record<string, string>> = {
  Watching: "lucide:play",
  Playing: "lucide:gamepad-2",
  Reading: "lucide:book-open-text",
  Planning: "lucide:clock",
  Completed: "lucide:check",
  Paused: "lucide:pause",
  Dropped: "lucide:x",
};

export function UserProgressTab({
  userId,
  contentType,
  onContentTypeChange,
}: {
  userId: string;
  contentType: ApiTypes.ReviewContentType;
  onContentTypeChange: (contentType: ApiTypes.ReviewContentType) => void;
}) {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProgressFilters>(EMPTY_PROGRESS_FILTERS);
  const [sort, setSort] = useState<ProgressSort>(DEFAULT_PROGRESS_SORT);
  const [selectedStatus, setSelectedStatus] = useState<ApiTypes.ProgressStatus>(
    PROGRESS_CONTENT[contentType].activeStatus,
  );
  const [isRandomizing, setIsRandomizing] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 600);
  // Free-text inputs are debounced so typing doesn't fire a request per keystroke.
  const debouncedYear = useDebounce(filters.year, 500);
  const appliedFilters = useMemo<ProgressFilters>(
    () => ({ ...filters, year: debouncedYear, search: debouncedSearch }),
    [filters, debouncedYear, debouncedSearch],
  );

  const optionsQuery = useProgressFilterOptions(contentType, userId);
  const progressQuery = useUserProgress(contentType, userId, selectedStatus, appliedFilters, sort);
  const sortOptions = useMemo(() => progressSortOptions(contentType), [contentType]);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = progressQuery;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = useMemo(
    () =>
      (progressQuery.data?.pages ?? [])
        .flatMap(({ page }) => page.items)
        .map((row) => progressToItem(contentType, row))
        .filter((item): item is FavoriteItem => item !== null),
    [progressQuery.data, contentType],
  );

  const statusCounts = progressQuery.data?.pages[0]?.statusCounts ?? {};
  const totalInStatus = progressQuery.data?.pages[0]?.page.total ?? 0;

  const sections = useMemo(
    () =>
      progressStatusSections(contentType).map((section) => ({
        ...section,
        count: statusCounts[section.status] ?? 0,
      })),
    [contentType, statusCounts],
  );

  const activeSection = sections.find((section) => section.status === selectedStatus);
  const activeFilterCount = countActiveFilters(filters);

  // Filters and status are content-type specific, so they reset whenever the type changes —
  // including when another tab switches it through `onContentTypeChange`.
  useEffect(() => {
    setSearchQuery("");
    setFilters(EMPTY_PROGRESS_FILTERS);
    setSort(DEFAULT_PROGRESS_SORT);
    setSelectedStatus(PROGRESS_CONTENT[contentType].activeStatus);
    setIsRandomizing(false);
  }, [contentType]);

  const handleRandom = async () => {
    setIsRandomizing(true);

    try {
      const item = await fetchRandomProgress(contentType, userId, selectedStatus, appliedFilters);

      if (item) {
        window.open(`/${item.contentType}/${item.slug}`, "_blank", "noopener,noreferrer");
      }
    } finally {
      setIsRandomizing(false);
    }
  };

  const isEmpty = !progressQuery.isLoading && items.length === 0;
  const hasQuery = Boolean(debouncedSearch.trim()) || activeFilterCount > 0;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="flex flex-col gap-3 md:w-56 shrink-0">
        <div className="flex md:flex-col gap-1 overflow-x-auto">
          {CONTENT_TYPES.map(({ type, labelKey, icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => onContentTypeChange(type)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer",
                contentType === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon icon={icon} className="size-4 shrink-0" />
              <span>{t(labelKey)}</span>
            </button>
          ))}
        </div>

        <div className="px-1 flex gap-1.5">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
          <button
            type="button"
            onClick={handleRandom}
            disabled={isRandomizing || progressQuery.isLoading || totalInStatus === 0}
            title="Random"
            className="bg-primary cursor-pointer flex items-center justify-center size-9 shrink-0 rounded-lg transition-colors text-primary-foreground hover:text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon
              icon={isRandomizing ? "lucide:loader-circle" : "lucide:shuffle"}
              className={cn("size-4", isRandomizing && "animate-spin")}
            />
          </button>
        </div>

        <div className="flex md:flex-col gap-1 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.status}
              type="button"
              onClick={() => setSelectedStatus(section.status)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer",
                selectedStatus === section.status
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon icon={SECTION_ICONS[section.status] ?? "lucide:list"} className="size-3.5 shrink-0" />
              <span className="flex-1 text-left">{t(section.labelKey)}</span>
              {section.count > 0 && <span className="text-xs opacity-60 tabular-nums">{section.count}</span>}
            </button>
          ))}
        </div>

        <div className="px-1 flex gap-1.5">
          <Select
            value={sort.by}
            onValueChange={(by) => setSort((current) => ({ ...current, by: by as ApiTypes.ProgressSortBy }))}
          >
            <SelectTrigger className="flex-1 min-w-0 bg-muted/50">
              <SelectValue placeholder={t("user:sort.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(({ value, labelKey }) => (
                <SelectItem key={value} value={value}>
                  {t(labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setSort((current) => ({ ...current, order: current.order === "asc" ? "desc" : "asc" }))}
            title={sort.order === "asc" ? t("common:ascending") : t("common:descending")}
            aria-label={sort.order === "asc" ? t("common:ascending") : t("common:descending")}
            className="bg-muted/50 cursor-pointer flex items-center justify-center size-9 shrink-0 rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
          >
            <Icon
              icon={sort.order === "asc" ? "lucide:arrow-up-narrow-wide" : "lucide:arrow-down-wide-narrow"}
              className="size-4"
            />
          </button>
        </div>

        <div className="px-1 pt-1">
          <ProgressFiltersPanel
            contentType={contentType}
            options={optionsQuery.data}
            isLoading={optionsQuery.isLoading}
            value={filters}
            activeCount={activeFilterCount}
            onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
            onClear={() => setFilters(EMPTY_PROGRESS_FILTERS)}
          />
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col gap-5">
        {progressQuery.isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <ProgressSkeleton key={index} />
            ))}
          </div>
        ) : isEmpty ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon={hasQuery ? "lucide:search-x" : "lucide:chart-line"} />
              </EmptyMedia>
              <EmptyTitle>{hasQuery ? t("user:noSearchResults") : t("user:noProgress")}</EmptyTitle>
              <EmptyDescription>
                {hasQuery ? t("user:noSearchResultsDescription") : t("user:noProgressDescription")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            <h4 className="text-lg font-semibold text-card-foreground">
              {t(activeSection?.labelKey ?? "")} ({totalInStatus})
            </h4>
            <Grid minColSize={"128px"} className="grid-cols-5">
              {items.map((item) => (
                <CardItem
                  key={item.id}
                  title={item.title}
                  url={`/${item.contentType}/${item.slug}`}
                  imageURL={item.image}
                  rating={item.score ?? undefined}
                />
              ))}
            </Grid>
          </div>
        )}

        <div ref={sentinelRef} />

        {progressQuery.isFetchingNextPage && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProgressSkeleton key={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressSkeleton() {
  return <Skeleton className="aspect-3/4 w-full rounded-2xl" />;
}

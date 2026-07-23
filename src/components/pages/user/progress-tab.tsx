import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FavoriteItem } from "@/components/pages/user/overview-tab/favorite-card";
import { CardItem } from "@/components/shared/cards/card";
import { SearchInput } from "@/components/shared/search-input";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { PROGRESS_CONTENT, progressStatusSections, progressToItem, useUserProgress } from "@/hooks/progress";
import type { ApiTypes } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/utils/useDebounce";

const CONTENT_TYPES: { type: ApiTypes.ReviewContentType; labelKey: string; icon: string }[] = [
  { type: "movie", labelKey: "common:types.movie_other", icon: "lucide:clapperboard" },
  { type: "tv", labelKey: "common:types.tv_other", icon: "lucide:tv" },
  { type: "game", labelKey: "common:types.game_other", icon: "lucide:gamepad-2" },
  { type: "anime", labelKey: "common:types.anime_other", icon: "lucide:sparkles" },
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
  progressStats,
  contentType,
  onContentTypeChange,
}: {
  userId: string;
  progressStats: ApiTypes.User["progressStats"];
  contentType: ApiTypes.ReviewContentType;
  onContentTypeChange: (contentType: ApiTypes.ReviewContentType) => void;
}) {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<ApiTypes.ProgressStatus | null>(null);
  const debouncedQuery = useDebounce(searchQuery, 600);
  const normalizedQuery = debouncedQuery.trim().toLowerCase();

  const progressQuery = useUserProgress(contentType, userId);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && progressQuery.hasNextPage && !progressQuery.isFetchingNextPage) {
          progressQuery.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [progressQuery.hasNextPage, progressQuery.isFetchingNextPage, progressQuery.fetchNextPage]);

  const rows = useMemo(() => progressQuery.data?.pages.flatMap((page) => page.items) ?? [], [progressQuery.data]);

  const typeStats = useMemo(
    () => progressStats[PROGRESS_CONTENT[contentType].statsKey] as unknown as Record<string, { count: number }>,
    [contentType, progressStats],
  );

  const sidebarSections = useMemo(
    () =>
      progressStatusSections(contentType).map((section) => ({
        ...section,
        count: typeStats[section.statsKey]?.count ?? 0,
      })),
    [contentType, typeStats],
  );

  const sections = useMemo(() => {
    return progressStatusSections(contentType)
      .map((section) => {
        const items = rows
          .filter((row) => row.status === section.status)
          .map((row) => progressToItem(contentType, row))
          .filter((item): item is FavoriteItem => item !== null)
          .filter((item) => !normalizedQuery || item.title.toLowerCase().includes(normalizedQuery));

        return {
          ...section,
          count: normalizedQuery ? items.length : (typeStats[section.statsKey]?.count ?? 0),
          items,
        };
      })
      .filter((section) => section.items.length > 0)
      .filter((section) => !selectedSection || section.status === selectedSection);
  }, [rows, contentType, typeStats, normalizedQuery, selectedSection]);

  const handleContentTypeChange = (value: ApiTypes.ReviewContentType) => {
    onContentTypeChange(value);
    setSearchQuery("");
    setSelectedSection(null);
  };

  const isEmpty = !progressQuery.isLoading && sections.length === 0;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="flex flex-col gap-3 md:w-44 shrink-0">
        <div className="flex md:flex-col gap-1 overflow-x-auto">
          {CONTENT_TYPES.map(({ type, labelKey, icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => handleContentTypeChange(type)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                contentType === type
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon icon={icon} className="size-4 shrink-0" />
              <span>{t(labelKey)}</span>
            </button>
          ))}
        </div>

        <div className="px-1">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="flex md:flex-col gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedSection(null)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0",
              !selectedSection
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Icon icon="lucide:layers" className="size-3.5 shrink-0" />
            <span>{t("common:all")}</span>
          </button>
          {sidebarSections.map((section) => (
            <button
              key={section.status}
              type="button"
              onClick={() => setSelectedSection(selectedSection === section.status ? null : section.status)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                selectedSection === section.status
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon icon={SECTION_ICONS[section.status] ?? "lucide:list"} className="size-3.5 shrink-0" />
              <span className="flex-1 text-left">{t(section.labelKey)}</span>
              {section.count > 0 && <span className="text-xs opacity-60 tabular-nums">{section.count}</span>}
            </button>
          ))}
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
                <Icon icon={normalizedQuery ? "lucide:search-x" : "lucide:chart-line"} />
              </EmptyMedia>
              <EmptyTitle>{normalizedQuery ? t("user:noSearchResults") : t("user:noProgress")}</EmptyTitle>
              <EmptyDescription>
                {normalizedQuery ? t("user:noSearchResultsDescription") : t("user:noProgressDescription")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          sections.map((section) => (
            <div key={section.status} className="flex flex-col gap-3">
              <h4 className="text-lg font-semibold text-card-foreground">
                {t(section.labelKey)} ({section.count})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {section.items.map((item) => (
                  <CardItem
                    key={item.id}
                    title={item.title}
                    url={`/${item.contentType}/${item.slug}`}
                    imageURL={item.image}
                    rating={item.score ?? undefined}
                  />
                ))}
              </div>
            </div>
          ))
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

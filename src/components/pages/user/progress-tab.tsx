import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FavoriteCard, type FavoriteItem } from "@/components/pages/user/overview-tab/favorite-card";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PROGRESS_CONTENT, progressStatusSections, progressToItem, useUserProgress } from "@/hooks/progress";
import type { ApiTypes } from "@/lib/api";
import { useDebounce } from "@/lib/utils/useDebounce";

const CONTENT_TYPES: { type: ApiTypes.ReviewContentType; labelKey: string }[] = [
  { type: "game", labelKey: "common:types.game_other" },
  { type: "tv", labelKey: "common:types.tv_other" },
  { type: "anime", labelKey: "common:types.anime_other" },
  { type: "movie", labelKey: "common:types.movie_other" },
  { type: "manga", labelKey: "common:types.manga_other" },
  { type: "book", labelKey: "common:types.book_other" },
];

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
  const debouncedQuery = useDebounce(searchQuery, 600);
  const normalizedQuery = debouncedQuery.trim().toLowerCase();

  const progressQuery = useUserProgress(contentType, userId);

  const rows = useMemo(() => progressQuery.data?.pages.flatMap((page) => page.items) ?? [], [progressQuery.data]);

  const sections = useMemo(() => {
    const typeStats = progressStats[PROGRESS_CONTENT[contentType].statsKey] as unknown as Record<
      string,
      { count: number }
    >;

    return progressStatusSections(contentType)
      .map((section) => {
        const items = rows
          .filter((row) => row.status === section.status)
          .map((row) => progressToItem(contentType, row))
          .filter((item): item is FavoriteItem => item !== null)
          .filter((item) => !normalizedQuery || item.title.toLowerCase().includes(normalizedQuery));

        return {
          ...section,
          // When searching, count reflects the filtered (loaded) matches; otherwise the accurate total from stats.
          count: normalizedQuery ? items.length : (typeStats[section.statsKey]?.count ?? 0),
          items,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [rows, contentType, progressStats, normalizedQuery]);

  const handleContentTypeChange = (value: string) => {
    onContentTypeChange(value as ApiTypes.ReviewContentType);
    setSearchQuery("");
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row gap-5 sm:items-end">
        <div className="w-full sm:w-40">
          <Select value={contentType} onValueChange={handleContentTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CONTENT_TYPES.map(({ type, labelKey }) => (
                  <SelectItem key={type} value={type}>
                    {t(labelKey)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      {progressQuery.isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProgressSkeleton key={index} />
          ))}
        </div>
      ) : sections.length === 0 ? (
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {section.items.map((item) => (
                <FavoriteCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))
      )}

      {progressQuery.hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => progressQuery.fetchNextPage()}
            disabled={progressQuery.isFetchingNextPage}
          >
            {progressQuery.isFetchingNextPage ? t("user:loading") : t("user:loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}

function ProgressSkeleton() {
  return <Skeleton className="aspect-[3/4] w-full rounded-2xl" />;
}

import { Icon } from "@iconify/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { useToggleActivityReaction, useUserActivities } from "@/hooks/activity";
import type { ApiTypes } from "@/lib/api";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll";
import { ActivityItem } from "./activity-item";
import { normalizeActivityGroup } from "./normalize";
import { ScreenshotActivityItem } from "./screenshot-item";

interface ActivityFeedProps {
  query: ReturnType<typeof useUserActivities>;
  toggleReaction: ReturnType<typeof useToggleActivityReaction>;
  emptyTitle: string;
  emptyDescription?: string;
}

export function ActivityFeed({ query, toggleReaction, emptyTitle, emptyDescription }: ActivityFeedProps) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  const entries = useMemo(() => {
    const groups = data?.pages.flatMap((page) => page.items) ?? [];
    return groups
      .map((group, index) => ({
        key: `${group.type}-${group.createdAt}-${index}`,
        entry: normalizeActivityGroup(group),
      }))
      .filter(
        (row): row is { key: string; entry: NonNullable<ReturnType<typeof normalizeActivityGroup>> } =>
          row.entry !== null,
      );
  }, [data]);

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full gap-y-3">
        {[...Array(4)].map((_, index) => (
          <FeedItemSkeleton key={`activity-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon="lucide:circle-alert" />
          </EmptyMedia>
          <EmptyTitle>{t("common:somethingWentWrong")}</EmptyTitle>
          <EmptyDescription>{t("common:tryAgainLater")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => refetch()}>
            {t("common:tryAgain")}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (entries.length === 0) {
    return (
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon="lucide:activity" />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          {emptyDescription && <EmptyDescription>{emptyDescription}</EmptyDescription>}
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col w-full gap-y-3">
      {entries.map(({ key, entry }, index) => {
        const onReact = (emoji: string, currentReaction?: ApiTypes.ActivityReaction) =>
          entry.item.activityId && toggleReaction.mutate({ activityId: entry.item.activityId, currentReaction, emoji });

        const isReacting = toggleReaction.isPending && toggleReaction.variables?.activityId === entry.item.activityId;

        return (
          <div
            key={key}
            className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 fill-mode-both duration-300"
            style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
          >
            {entry.kind === "screenshot" ? (
              <ScreenshotActivityItem
                profile={entry.profile}
                item={entry.item}
                onReact={onReact}
                isReacting={isReacting}
              />
            ) : (
              <ActivityItem profile={entry.profile} item={entry.item} onReact={onReact} isReacting={isReacting} />
            )}
          </div>
        );
      })}

      <div ref={sentinelRef} className="h-px" />

      {isFetchingNextPage && <FeedItemSkeleton />}
    </div>
  );
}

function FeedItemSkeleton() {
  return (
    <div className="flex w-full overflow-hidden rounded-xl border border-border bg-card">
      <Skeleton className="h-35 w-24 shrink-0 rounded-none sm:w-30" />

      <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:px-6 sm:py-6">
        <Skeleton className="h-4 w-2/3 max-w-64" />

        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

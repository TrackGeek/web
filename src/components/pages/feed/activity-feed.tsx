import { Icon } from "@iconify/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { useToggleActivityReaction, useUserActivities } from "@/hooks/activity";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll";
import { ActivityItem } from "./activity-item";
import { normalizeActivityGroup } from "./normalize";

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
        entry: normalizeActivityGroup(group, t),
      }))
      .filter(
        (row): row is { key: string; entry: NonNullable<ReturnType<typeof normalizeActivityGroup>> } =>
          row.entry !== null,
      );
  }, [data, t]);

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full gap-y-3">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={`activity-skeleton-${index}`} className="h-30 w-full rounded-2xl" />
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
      {entries.map(({ key, entry }) => (
        <ActivityItem
          key={key}
          profile={entry.profile}
          item={entry.item}
          onReact={(emoji, currentReaction) =>
            entry.item.activityId &&
            toggleReaction.mutate({ activityId: entry.item.activityId, currentReaction, emoji })
          }
          isReacting={toggleReaction.isPending && toggleReaction.variables?.activityId === entry.item.activityId}
        />
      ))}

      <div ref={sentinelRef} className="h-px" />

      {isFetchingNextPage && <Skeleton className="h-30 w-full rounded-2xl" />}
    </div>
  );
}

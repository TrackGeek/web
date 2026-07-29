import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { type ScreenshotImage, ScreenshotItem } from "@/components/shared/cards/screenshot";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useGameScreenshots } from "@/hooks/game";
import type { ApiTypes } from "@/lib/api";

interface GameScreenshotGroup {
  game: ApiTypes.GameScreenshotGame;
  images: ScreenshotImage[];
}

export function UserScreenshotsTab({ userId }: { userId: string }) {
  const { t } = useTranslation();

  const screenshotsQuery = useGameScreenshots({ userId });

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && screenshotsQuery.hasNextPage && !screenshotsQuery.isFetchingNextPage) {
          screenshotsQuery.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [screenshotsQuery.hasNextPage, screenshotsQuery.isFetchingNextPage, screenshotsQuery.fetchNextPage]);

  // Groups by game keeping the order the screenshots came in (newest first).
  const groups = useMemo(() => {
    const screenshots = screenshotsQuery.data?.pages.flatMap((page) => page.items) ?? [];
    const byGame = new Map<string, GameScreenshotGroup>();

    for (const screenshot of screenshots) {
      const group = byGame.get(screenshot.game.id) ?? { game: screenshot.game, images: [] };

      group.images.push({
        id: screenshot.id,
        url: screenshot.url,
        description: screenshot.description,
        isSpoiler: screenshot.isSpoiler,
      });

      byGame.set(screenshot.game.id, group);
    }

    return [...byGame.values()];
  }, [screenshotsQuery.data]);

  if (screenshotsQuery.isLoading) {
    return <ScreenshotsSkeleton />;
  }

  if (groups.length === 0) {
    return (
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon="lucide:images" />
          </EmptyMedia>
          <EmptyTitle>{t("user:noScreenshots")}</EmptyTitle>
          <EmptyDescription>{t("user:noScreenshotsDescription")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Grid minColSize={"128px"} className="flex w-full flex-col rounded-2xl py-4 px-2 gap-6">
        {groups.map((group) => (
          <ScreenshotItem
            key={group.game.id}
            title={group.game.name}
            imageURL={group.game.coverUrl ?? ""}
            images={group.images}
          />
        ))}
      </Grid>

      <div ref={sentinelRef} />

      {screenshotsQuery.isFetchingNextPage && <ScreenshotsSkeleton length={4} />}
    </div>
  );
}

function ScreenshotsSkeleton({ length = 8 }: { length?: number }) {
  return (
    <Grid minColSize={"128px"} className="flex w-full flex-col rounded-2xl py-4 px-2 gap-6">
      {Array.from({ length }).map((_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="aspect-3/4 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </Grid>
  );
}

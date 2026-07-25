import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFiltered } from "@/components/shared/loadings/filtered.tsx";
import { api } from "@/lib/api.ts";
import { seo } from "@/lib/utils/seo.ts";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll.ts";

export const Route = createFileRoute("/game/recent/")({
  ssr: "data-only",
  component: RecentGameRoute,
  head: () => ({
    meta: [
      ...seo({
        title: "Recent Games",
        description:
          "Just released and ready to play. Browse the latest game launches, day-one reviews, and recently added titles to your favorite platforms and subscription services.",
      }),
    ],
  }),
});

function RecentGameRoute() {
  const { t } = useTranslation();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["game", "infiniteRecentlyReleased"],
    queryFn: ({ pageParam }) => {
      const url =
        pageParam === 1 ? "/game/top?filter=recentlyReleased" : `/game/top?filter=recentlyReleased&page=${pageParam}`;
      return api.get(url);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { hasNextPage, nextCursor } = lastPage?.data?.topGames || {};
      return hasNextPage ? nextCursor : undefined;
    },
  });

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  if (isError) return <ErrorComponent />;
  if (isLoading) return <LoadingFiltered />;

  const games = data?.pages.flatMap((p) => p?.data?.topGames?.items ?? []) ?? [];

  return (
    <div className="mx-auto w-full py-6 space-y-4">
      <p className="text-2xl font-bold mb-4">{t("common:recentlyReleased")}</p>
      <Grid minColSize={"128px"} className={"grid-cols-5"}>
        {games?.map((game) => {
          const releaseDate = game.firstReleaseDate ? new Date(game.firstReleaseDate) : null;
          const releaseYear =
            releaseDate && !Number.isNaN(releaseDate.getTime()) ? releaseDate.getFullYear() : undefined;

          return (
            <CardItem
              title={game.name}
              url={`/game/${game.igdbId}`}
              imageURL={game.coverUrl}
              rating={game.rating}
              year={releaseYear}
              synopsis={game.summary}
              mediaType={"game"}
              key={game.igdbId}
            />
          );
        })}
      </Grid>
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage && <LoadingFiltered />}
    </div>
  );
}

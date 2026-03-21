import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFiltered } from "@/components/shared/loadings/filtered.tsx";
import { api } from "@/lib/api.ts";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll.ts";

export const Route = createFileRoute("/game/antecipated/")({
  component: AntecipatedGameRoute,
});

function AntecipatedGameRoute() {
  const { t } = useTranslation();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["game", "infiniteAntecipated"],
    queryFn: ({ pageParam }) => {
      const url = pageParam === 1 ? "/game/top?filter=antecipated" : `/game/top?filter=antecipated&page=${pageParam}`;
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
      <p className="text-2xl font-bold mb-4">{t("common:mostAnticipated")}</p>
      <Grid minColSize={"128px"} className={"grid-cols-5"}>
        {games?.map((game: any) => {
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

import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { CardItem } from "@/components/shared/cards/card";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFiltered } from "@/components/shared/loadings/filtered.tsx";
import { api } from "@/lib/api";
import { seo } from "@/lib/utils/seo.ts";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll.ts";

export const Route = createFileRoute("/anime/top/")({
  component: TopAnimeRoute,
  head: () => ({
    meta: [
      ...seo({
        title: "Top Anime",
        description:
          "Explore the highest-rated anime of all time. Browse the global rankings, top-rated movies, and most popular series according to the community.",
      }),
    ],
  }),
});

function TopAnimeRoute() {
  const { t } = useTranslation();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["anime", "infiniteTop"],
    queryFn: ({ pageParam }) => {
      const url = pageParam === 1 ? "/anime/top?filter=favorite" : `/anime/top?filter=favorite&page=${pageParam}`;
      return api.get(url);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { hasNextPage, nextCursor } = lastPage?.data?.animes || {};
      return hasNextPage ? nextCursor : undefined;
    },
  });

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  if (isError) return <ErrorComponent />;
  if (isLoading) return <LoadingFiltered />;

  const animes = data?.pages.flatMap((p) => p?.data?.animes?.items ?? []) ?? [];

  return (
    <div className="mx-auto w-full py-6 space-y-4">
      <p className="text-2xl font-bold mb-4">{t("common:topAnime")}</p>
      <Grid minColSize={"128px"} className={"grid-cols-5"}>
        {animes?.map((anime) => (
          <CardItem
            title={anime.title}
            url={`/anime/${anime.malId}`}
            imageURL={
              (anime.imageUrl ?? "").replace(
                "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                "/placeholder/cover.webp",
              ) || "/placeholder/cover.webp"
            }
            rating={+anime.rating}
            year={anime.airedFrom ? new Date(anime.airedFrom).getFullYear() : undefined}
            synopsis={anime.synopsis}
            isAdult={anime.isAdult}
            mediaType={"anime"}
            key={anime.malId}
          />
        ))}
      </Grid>
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage && <LoadingFiltered />}
    </div>
  );
}

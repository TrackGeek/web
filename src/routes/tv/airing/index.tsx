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

export const Route = createFileRoute("/tv/airing/")({
  ssr: "data-only",
  component: AiringTVShowRoute,
  head: () => ({
    meta: [
      ...seo({
        title: "Airing TV Shows",
        description:
          "Track TV episodes airing today. Get real-time schedules, countdowns, and never miss a new episode of your favorite ongoing series and reality shows.",
      }),
    ],
  }),
});

function AiringTVShowRoute() {
  const { t } = useTranslation();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["tvShow", "top", "infiniteAiring"],
    queryFn: ({ pageParam }) => {
      const url = pageParam === 1 ? "/tv/top?filter=airing" : `/tv/top?filter=airing&page=${pageParam}`;
      return api.get(url);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { hasNextPage, nextCursor } = lastPage?.data?.topTVShows || {};
      return hasNextPage ? nextCursor : undefined;
    },
  });

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  if (isError) return <ErrorComponent />;
  if (isLoading) return <LoadingFiltered />;

  const tvShows = data?.pages.flatMap((p) => p?.data?.topTVShows?.items ?? []) ?? [];

  return (
    <div className="mx-auto w-full py-6 space-y-4">
      <p className="text-2xl font-bold mb-4">{t("library:statusAir.currentlyAiring")}</p>
      <Grid minColSize={"128px"} className={"grid-cols-5"}>
        {tvShows?.map((serie) => {
          const firstAirDate = serie.firstAirDate ? new Date(serie.firstAirDate) : null;
          const airYear =
            firstAirDate && !Number.isNaN(firstAirDate.getTime()) ? firstAirDate.getFullYear() : undefined;
          return (
            <CardItem
              title={serie.name}
              url={`/tv/${serie.tmdbId}`}
              imageURL={serie.posterUrl || "/placeholder/cover.webp"}
              rating={serie.rating}
              year={airYear}
              synopsis={serie.tagline}
              mediaType={"tv"}
              key={serie.tmdbId}
            />
          );
        })}
      </Grid>
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage && <LoadingFiltered />}
    </div>
  );
}

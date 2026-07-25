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

export const Route = createFileRoute("/tv/popular/")({
  ssr: "data-only",
  component: PopularTVShowRoute,
  head: () => ({
    meta: [
      ...seo({
        title: "Popular TV Shows",
        description:
          "Discover the most-watched TV shows right now. Explore top-rated series across Netflix, HBO, Disney+, and cable networks according to the community.",
      }),
    ],
  }),
});

function PopularTVShowRoute() {
  const { t } = useTranslation();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["tvShow", "top", "infinitePopular"],
    queryFn: ({ pageParam }) => {
      const url = pageParam === 1 ? "/tv/top?filter=popular" : `/tv/top?filter=popular&page=${pageParam}`;
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
      <p className="text-2xl font-bold mb-4">{t("common:mostPopular")}</p>
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

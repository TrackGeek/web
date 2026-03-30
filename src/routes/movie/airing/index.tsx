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

export const Route = createFileRoute("/movie/airing/")({
  component: AiringMovieRoute,
  head: () => ({
    meta: [
      ...seo({
        title: "Airing Movies",
        description:
          "See what's playing in theaters right now. Get showtimes, trailers, and track the latest cinematic releases from major studios and indie creators.",
      }),
    ],
  }),
});

function AiringMovieRoute() {
  const { t } = useTranslation();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["movie", "top", "infiniteAiring"],
    queryFn: ({ pageParam }) => {
      const url = pageParam === 1 ? "/movie/top?filter=airing" : `/movie/top?filter=airing&page=${pageParam}`;
      return api.get(url);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { hasNextPage, nextCursor } = lastPage?.data?.movies || {};
      return hasNextPage ? nextCursor : undefined;
    },
  });

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  if (isError) return <ErrorComponent />;
  if (isLoading) return <LoadingFiltered />;

  const movies = data?.pages.flatMap((p) => p?.data?.movies?.items ?? []) ?? [];

  return (
    <div className="mx-auto w-full py-6 space-y-4">
      <p className="text-2xl font-bold mb-4">{t("common:topAiring")}</p>
      <Grid minColSize={"128px"} className={"grid-cols-5"}>
        {movies?.map((movie: any) => (
          <CardItem
            title={movie.name}
            url={`/movie/${movie.tmdbId}`}
            imageURL={movie.posterUrl || "/placeholder/cover.webp"}
            rating={movie.rating}
            year={movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined}
            synopsis={movie.overview}
            mediaType={"movie"}
            key={movie.tmdbId}
          />
        ))}
      </Grid>
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage && <LoadingFiltered />}
    </div>
  );
}

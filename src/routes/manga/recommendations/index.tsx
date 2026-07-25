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

export const Route = createFileRoute("/manga/recommendations/")({
  ssr: "data-only",
  component: RecommendationsMangaRoute,
  head: () => ({
    meta: [
      ...seo({
        title: "Manga Recommendations",
        description:
          "Manga recommendations based on other otaku readers. Discover hidden gems, trending Manhwa, and classic series tailored to your reading history and favorite genres.",
      }),
    ],
  }),
});

function RecommendationsMangaRoute() {
  const { t } = useTranslation();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["manga", "top", "infiniteRecommendations"],
    queryFn: ({ pageParam }) => {
      const url =
        pageParam === 1 ? "/manga/top?filter=bypopularity" : `/manga/top?filter=bypopularity&page=${pageParam}`;
      return api.get(url);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { hasNextPage, nextCursor } = lastPage?.data?.mangas || {};
      return hasNextPage ? nextCursor : undefined;
    },
  });

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  if (isError) return <ErrorComponent />;
  if (isLoading) return <LoadingFiltered />;

  const mangas = data?.pages.flatMap((p) => p?.data?.mangas?.items ?? []) ?? [];

  return (
    <div className="mx-auto w-full py-6 space-y-4">
      <p className="text-2xl font-bold mb-4">{t("common:recommendations")}</p>
      <Grid minColSize={"128px"} className={"grid-cols-5"}>
        {mangas?.map((manga) => (
          <CardItem
            title={manga.title}
            url={`/manga/${manga.malId}`}
            imageURL={manga.imageUrl.replace(
              "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
              "/placeholder/cover.webp",
            )}
            rating={manga.rating}
            year={new Date(manga.publishedFrom).getFullYear()}
            synopsis={manga.synopsis}
            isAdult={manga.isAdult}
            mediaType={"manga"}
            key={manga.malId}
          />
        ))}
      </Grid>
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage && <LoadingFiltered />}
    </div>
  );
}

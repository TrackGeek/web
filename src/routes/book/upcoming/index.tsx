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

export const Route = createFileRoute("/book/upcoming/")({
  component: UpcomingBookRoute,
  head: () => ({
    meta: [
      ...seo({
        title: "Upcoming Books",
        description:
          "Be the first to read the most anticipated books. Stay updated on new releases, pre-order dates, and upcoming sequels from your favorite authors.",
      }),
    ],
  }),
});

function UpcomingBookRoute() {
  const { t } = useTranslation();

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["book", "infiniteUpcoming"],
    queryFn: ({ pageParam }) => {
      const url = pageParam === 1 ? "/book/top?filter=comingSoon" : `/book/top?filter=comingSoon&page=${pageParam}`;
      return api.get(url);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { hasNextPage, nextCursor } = lastPage?.data?.topBooks || {};
      return hasNextPage ? nextCursor : undefined;
    },
  });

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  if (isError) return <ErrorComponent />;
  if (isLoading) return <LoadingFiltered />;

  const books = data?.pages.flatMap((p) => p?.data?.topBooks?.items ?? []) ?? [];

  return (
    <div className="mx-auto w-full py-6 space-y-4">
      <p className="text-2xl font-bold mb-4">{t("common:comingSoon")}</p>
      <Grid minColSize={"128px"} className={"grid-cols-5"}>
        {books?.map((book: any) => (
          <CardItem
            title={book.title}
            url={`/book/${book.id}`}
            imageURL={book.imageUrl}
            rating={0}
            year={book.releaseYear}
            synopsis={book.description}
            mediaType={"book"}
            key={book.id}
          />
        ))}
      </Grid>
      <div ref={sentinelRef} className="h-px" />
      {isFetchingNextPage && <LoadingFiltered />}
    </div>
  );
}

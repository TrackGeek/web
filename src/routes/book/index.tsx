import { useQueries } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFeatured } from "@/components/shared/loadings/featured.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx";
import { api, apiEndpoints } from "@/lib/api.ts";
import { seo } from "@/lib/utils/seo.ts";

export const Route = createFileRoute("/book/")({
  ssr: "data-only",
  component: BookRoute,
  head: () => ({
    meta: [
      ...seo({
        title: "Books",
        description:
          "Your personal digital library. Track your reading progress, manage your TBR pile, and view detailed stats of your reading habits and favorite genres.",
      }),
    ],
  }),
});

function BookRoute() {
  const { t } = useTranslation();

  const results = useQueries({
    queries: [
      {
        queryKey: ["book", "trending"],
        queryFn: () => api.get(apiEndpoints.getBookTrending),
      },
      {
        queryKey: ["book", "comingSoon"],
        queryFn: () => api.get(apiEndpoints.getBookComingSoon),
      },
    ],
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  const [trendingResult, comingSoonResult] = results;

  const trendingQuery = trendingResult.data?.data.topBooks.items;
  const comingSoonQuery = comingSoonResult.data?.data.topBooks.items;

  if (isError) return <ErrorComponent />;

  if (isLoading) return <LoadingFeatured numberOfSections={2} />;

  return (
    <div className="mx-auto w-full">
      <Carousel
        className="w-full"
        opts={{
          loop: true,
          align: "center",
        }}
      >
        <CarouselContent>
          {trendingQuery?.slice(0, 3).map((book: any, index: number) => {
            return (
              <CarouselItem key={book.id}>
                <div className="relative w-full overflow-hidden rounded-xl border border-border">
                  <Image
                    src={`/placeholder/banner-${index + 1}.webp`}
                    layout="fullWidth"
                    aspectRatio={16 / 9}
                    className="w-full h-60 md:h-120 object-cover"
                    alt={book.title}
                  />

                  <div
                    className="absolute inset-0 bg-linear-to-t from-primary-foreground/80 via-primary-foreground/30
 to-transparent"
                  />

                  <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
                    <h2 className="text-4xl font-bold drop-shadow-lg">{book.title}</h2>

                    <div className="max-w-2xl hidden md:block">
                      <p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">{book.description}</p>
                    </div>

                    <Link
                      to={"/book/$slug"}
                      params={{ slug: book.id }}
                      className="bg-primary text-primary-foreground w-fit px-6 py-2 rounded-full font-semibold hover:brightness-110 transition-all shadow-lg"
                    >
                      {t("common:viewDetails")}
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious variant="default" className="left-4 bg-white border-none hover:bg-white/80 z-10" />
        <CarouselNext variant="default" className="right-4 bg-white border-none hover:bg-white/80 z-10" />
      </Carousel>
      <div className="space-y-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("feed:trending")}</p>
          <Link to={"/book/trending"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {trendingQuery?.slice(0, 16).map((book: any) => (
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:comingSoon")}</p>
          <Link to={"/book/upcoming"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {comingSoonQuery?.slice(0, 16).map((book: any) => (
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
      </div>
    </div>
  );
}

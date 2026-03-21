import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFeatured } from "@/components/shared/loadings/featured";
import { Button } from "@/components/ui/button.tsx";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx";
import { api } from "@/lib/api.ts";

export const Route = createFileRoute("/manga/")({
  component: MangaRoute,
});

function MangaRoute() {
  const { t } = useTranslation();
  const {
    data: publishingData,
    isLoading: publishingLoading,
    isError: publishingError,
  } = useQuery({
    queryKey: ["manga", "publishing"],
    queryFn: () => api.get("/manga/top?filter=publishing"),
  });

  const publishing = publishingData?.data.mangas.items;

  const {
    data: upcomingData,
    isLoading: upcomingLoading,
    isError: upcomingError,
  } = useQuery({
    queryKey: ["manga", "upcoming"],
    queryFn: () => api.get("/manga/top?filter=upcoming"),
  });

  const upcoming = upcomingData?.data.mangas.items;

  const {
    data: favoriteData,
    isLoading: favoriteLoading,
    isError: favoriteError,
  } = useQuery({
    queryKey: ["manga", "favorite"],
    queryFn: () => api.get("/manga/top?filter=favorite"),
  });

  const favorite = favoriteData?.data.mangas.items;

  const {
    data: recommendationsData,
    isLoading: recommendationsLoading,
    isError: recommendationsError,
  } = useQuery({
    queryKey: ["manga", "recommendations"],
    queryFn: () => api.get("/manga/top?filter=bypopularity"),
  });

  const recommendations = recommendationsData?.data.mangas.items;

  if (publishingError || upcomingError || favoriteError || recommendationsError) return <ErrorComponent />;

  if (publishingLoading || upcomingLoading || favoriteLoading || recommendationsLoading)
    return <LoadingFeatured numberOfSections={4} />;

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
          {publishing?.slice(0, 3).map((manga: any, index: number) => {
            return (
              <CarouselItem key={manga.malId}>
                <div className="relative w-full overflow-hidden rounded-xl border border-border">
                  <img
                    src={`/placeholder/banner-${index + 1}.webp`}
                    className="w-full h-60 md:h-120 object-cover"
                    alt={manga.title}
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/30 to-transparent" />

                  <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
                    <h2 className="text-4xl font-bold drop-shadow-lg">{manga.title}</h2>

                    <div className="max-w-2xl hidden md:block">
                      <p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">{manga.synopsis}</p>
                    </div>

                    <Link
                      to={"/manga/$slug"}
                      params={{ slug: manga.malId }}
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
          <p className="text-2xl font-bold">{t("library:statusAir.publishing")}</p>
          <Link to={"/manga/publishing"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {publishing?.slice(0, 16).map((manga: any) => (
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
              mediaType={"manga"}
              key={manga.malId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:recommendations")}</p>
          <Link to={"/manga/recommendations"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {recommendations?.slice(0, 16).map((manga: any) => (
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
              mediaType={"manga"}
              key={manga.malId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:comingSoon")}</p>
          <Link to={"/manga/upcoming"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {upcoming?.slice(0, 16).map((manga: any) => (
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
              mediaType={"manga"}
              key={manga.malId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:topManga")}</p>
          <Link to={"/manga/top"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {favorite?.slice(0, 16).map((manga: any) => (
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
              mediaType={"manga"}
              key={manga.malId}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}

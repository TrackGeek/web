import ViteImage from "@son426/vite-image/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFeatured } from "@/components/shared/loadings/featured.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx";
import { api } from "@/lib/api.ts";

export const Route = createFileRoute("/tv/")({
  component: SerieRoute,
});

function SerieRoute() {
  const { t } = useTranslation();

  const {
    data: airingData,
    isLoading: airingLoading,
    isError: airingError,
  } = useQuery({
    queryKey: ["tv", "airing"],
    queryFn: () => api.get("/tv/top?filter=airing"),
  });

  const airing = airingData?.data.topTVShows;

  const {
    data: upcomingData,
    isLoading: upcomingLoading,
    isError: upcomingError,
  } = useQuery({
    queryKey: ["tv", "upcoming"],
    queryFn: () => api.get("/tv/top?filter=upcoming"),
  });

  const upcoming = upcomingData?.data.topTVShows;

  const {
    data: trendingData,
    isLoading: trendingLoading,
    isError: trendingError,
  } = useQuery({
    queryKey: ["tv", "trending"],
    queryFn: () => api.get("/tv/top?filter=trending"),
  });

  const trending = trendingData?.data.topTVShows;

  const {
    data: popularData,
    isLoading: popularLoading,
    isError: popularError,
  } = useQuery({
    queryKey: ["tv", "popular"],
    queryFn: () => api.get("/tv/top?filter=popular"),
  });

  const popular = popularData?.data.topTVShows;

  if (airingError || upcomingError || trendingError || popularError) return <ErrorComponent />;

  if (airingLoading || upcomingLoading || trendingLoading || popularLoading)
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
          {airing?.slice(0, 3).map((serie: any) => {
            return (
              <CarouselItem key={serie.tmdbId}>
                <div className="relative w-full overflow-hidden rounded-xl border border-border">
                  <ViteImage
                    src={{
                      src: serie.backdropUrl,
                      blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH",
                      height: 240,
                      width: 1920,
                    }}
                    className="w-full h-60 md:h-120 object-cover"
                    alt={serie.name}
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/30 to-transparent" />

                  <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
                    <h2 className="text-4xl font-bold drop-shadow-lg">{serie.name}</h2>

                    <div className="max-w-2xl hidden md:block">
                      <p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">{serie.tagline}</p>
                    </div>

                    <Link
                      to={"/tv/$slug"}
                      params={{ slug: serie.tmdbId }}
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
      <div className="py-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("feed:trending")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {trending?.slice(0, 16).map((serie: any) => (
            <CardItem
              title={serie.name}
              url={`/tv/${serie.tmdbId}`}
              imageURL={serie.posterUrl}
              rating={serie.rating}
              year={new Date(serie.firstAirDate).getFullYear()}
              synopsis={serie.tagline}
              mediaType={"tv"}
              key={serie.tmdbId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:mostPopular")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {popular?.slice(0, 16).map((serie: any) => (
            <CardItem
              title={serie.name}
              url={`/tv/${serie.tmdbId}`}
              imageURL={serie.posterUrl}
              rating={serie.rating}
              year={new Date(serie.firstAirDate).getFullYear()}
              synopsis={serie.tagline}
              mediaType={"tv"}
              key={serie.tmdbId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("library:statusAir.currentlyAiring")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {airing?.slice(0, 16).map((serie: any) => (
            <CardItem
              title={serie.name}
              url={`/tv/${serie.tmdbId}`}
              imageURL={serie.posterUrl}
              rating={serie.rating}
              year={new Date(serie.firstAirDate).getFullYear()}
              synopsis={serie.tagline}
              mediaType={"tv"}
              key={serie.tmdbId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:comingSoon")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {upcoming?.slice(0, 16).map((serie: any) => (
            <CardItem
              title={serie.name}
              url={`/tv/${serie.tmdbId}`}
              imageURL={serie.posterUrl}
              rating={serie.rating}
              year={new Date(serie.firstAirDate).getFullYear()}
              synopsis={serie.tagline}
              mediaType={"tv"}
              key={serie.tmdbId}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}

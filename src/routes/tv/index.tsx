import ViteImage from "@son426/vite-image/react";
import { useQueries } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFeatured } from "@/components/shared/loadings/featured.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx";
import { api, apiEndpoints } from "@/lib/api.ts";
import { seo } from "@/lib/utils/seo.ts";

export const Route = createFileRoute("/tv/")({
  component: SerieRoute,
  head: () => ({
    meta: [
      ...seo({
        title: "Airing TV Shows",
        description:
          "The ultimate TV show tracker and episode manager. Organize your watch history, discover new series, and sync your progress across all streaming platforms.",
      }),
    ],
  }),
});

function SerieRoute() {
  const { t } = useTranslation();

  const results = useQueries({
    queries: [
      {
        queryKey: ["tv", "airing"],
        queryFn: () => api.get(apiEndpoints.getTvShowAiring),
      },
      {
        queryKey: ["tv", "upcoming"],
        queryFn: () => api.get(apiEndpoints.getTvShowUpcoming),
      },
      {
        queryKey: ["tv", "trending"],
        queryFn: () => api.get(apiEndpoints.getTvShowTrending),
      },
      {
        queryKey: ["tv", "popular"],
        queryFn: () => api.get(apiEndpoints.getTvShowPopular),
      },
    ],
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  const [airingResult, upcomingResult, trendingResult, popularResult] = results;

  const airing = airingResult.data?.data.topTVShows.items;
  const upcoming = upcomingResult.data?.data.topTVShows.items;
  const trending = trendingResult.data?.data.topTVShows.items;
  const popular = popularResult.data?.data.topTVShows.items;

  if (isError) return <ErrorComponent />;

  if (isLoading) return <LoadingFeatured numberOfSections={4} />;

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

                  <div
                    className="absolute inset-0 bg-linear-to-t from-primary-foreground/80 via-primary-foreground/30
 to-transparent"
                  />

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
          <Link to={"/tv/trending"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {trending?.slice(0, 16).map((serie: any) => {
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:mostPopular")}</p>
          <Link to={"/tv/popular"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {popular?.slice(0, 16).map((serie: any) => {
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("library:statusAir.currentlyAiring")}</p>
          <Link to={"/tv/airing"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {airing?.slice(0, 16).map((serie: any) => {
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:comingSoon")}</p>
          <Link to={"/tv/upcoming"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {upcoming?.slice(0, 16).map((serie: any) => {
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
      </div>
    </div>
  );
}

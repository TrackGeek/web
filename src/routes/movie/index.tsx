import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx";
import { api } from "@/lib/api.ts";

export const Route = createFileRoute("/movie/")({
  component: MovieRoute,
});

function MovieRoute() {
  const { t } = useTranslation();

  const airingQuery = useQuery({
    queryKey: ["movie", "airing"],
    queryFn: () => api.get("/movie/top?filter=airing"),
  }).data?.data.movies;

  const upcomingQuery = useQuery({
    queryKey: ["movie", "upcoming"],
    queryFn: () => api.get("/movie/top?filter=upcoming"),
  }).data?.data.movies;

  const trendingQuery = useQuery({
    queryKey: ["movie", "trending"],
    queryFn: () => api.get("/movie/top?filter=trending"),
  }).data?.data.movies;

  const popularQuery = useQuery({
    queryKey: ["movie", "popular"],
    queryFn: () => api.get("/movie/top?filter=popular"),
  }).data?.data.movies;

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
          {airingQuery?.slice(0, 3).map((movie: any) => {
            return (
              <CarouselItem key={movie.tmdbId}>
                <div className="relative w-full overflow-hidden rounded-xl border border-border">
                  <img src={movie.backdropUrl} className="w-full h-60 md:h-120 object-cover" alt={movie.name} />

                  <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/30 to-transparent" />

                  <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
                    <h2 className="text-4xl font-bold drop-shadow-lg">{movie.name}</h2>

                    <div className="max-w-2xl hidden md:block">
                      <p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">{movie.overview}</p>
                    </div>

                    <Link
                      to={"/movie/$slug"}
                      params={{ slug: movie.tmdbId }}
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
          {trendingQuery?.slice(0, 16).map((movie: any) => (
            <CardItem
              title={movie.name}
              url={`/movie/${movie.tmdbId}`}
              imageURL={movie.posterUrl}
              rating={movie.rating}
              year={new Date(movie.releaseDate).getFullYear()}
              synopsis={movie.overview}
              mediaType={"movie"}
              key={movie.tmdbId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:mostPopular")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {popularQuery?.slice(0, 16).map((movie: any) => (
            <CardItem
              title={movie.name}
              url={`/movie/${movie.tmdbId}`}
              imageURL={movie.posterUrl}
              rating={movie.rating}
              year={new Date(movie.releaseDate).getFullYear()}
              synopsis={movie.overview}
              mediaType={"movie"}
              key={movie.tmdbId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("library:statusAir.currentlyAiring")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {airingQuery?.slice(0, 16).map((movie: any) => (
            <CardItem
              title={movie.name}
              url={`/movie/${movie.tmdbId}`}
              imageURL={movie.posterUrl}
              rating={movie.rating}
              year={new Date(movie.releaseDate).getFullYear()}
              synopsis={movie.overview}
              mediaType={"movie"}
              key={movie.tmdbId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:comingSoon")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {upcomingQuery?.slice(0, 16).map((movie: any) => (
            <CardItem
              title={movie.name}
              url={`/movie/${movie.tmdbId}`}
              imageURL={movie.posterUrl}
              rating={movie.rating}
              year={new Date(movie.releaseDate).getFullYear()}
              synopsis={movie.overview}
              mediaType={"movie"}
              key={movie.tmdbId}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}

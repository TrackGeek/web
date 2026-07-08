import { useQueries } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { CardItem } from "@/components/shared/cards/card";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFeatured } from "@/components/shared/loadings/featured.tsx";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { api, apiEndpoints } from "@/lib/api.ts";
import { seo } from "@/lib/utils/seo.ts";

export const Route = createFileRoute("/game/")({
  component: GameRoute,
  head: () => ({
    meta: [
      ...seo({
        title: "Games",
        description:
          "The ultimate video game database and backlog manager. Track your progress, sync your library, and discover new adventures across PC, console, and mobile.",
      }),
    ],
  }),
});

function GameRoute() {
  const { t } = useTranslation();

  const results = useQueries({
    queries: [
      {
        queryKey: ["game", "popular"],
        queryFn: () => api.get(apiEndpoints.getGamePopular),
      },
      {
        queryKey: ["game", "coming"],
        queryFn: () => api.get(apiEndpoints.getGameComing),
      },
      {
        queryKey: ["game", "anticipated"],
        queryFn: () => api.get(apiEndpoints.getGameAnticipated),
      },
      {
        queryKey: ["game", "recentlyReleased"],
        queryFn: () => api.get(apiEndpoints.getGameRecentlyReleased),
      },
    ],
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  const [popularResult, comingSoonResult, anticipatedResult, recentlyReleasedResult] = results;

  const popular = popularResult.data?.data.topGames.items;
  const comingSoon = comingSoonResult.data?.data.topGames.items;
  const anticipated = anticipatedResult.data?.data.topGames.items;
  const recentlyReleased = recentlyReleasedResult.data?.data.topGames.items;

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
          {popular?.slice(0, 3).map((game) => {
            const artworks = Array.isArray(game.artworks) ? game.artworks : [];
            const keyArt = artworks.find((a) => a.type === "Key art without logo")?.url;
            const logoArt = artworks.find((a) => a.type === "Game logo (color)")?.url;

            return (
              <CarouselItem key={game.id}>
                <div className="relative w-full overflow-hidden rounded-xl border border-border">
                  <Image
                    src={keyArt || artworks[0]?.url || game.coverUrl}
                    layout="fullWidth"
                    aspectRatio={16 / 9}
                    className="w-full h-60 md:h-120 object-cover object-top"
                    alt={game.name}
                  />

                  <div
                    className="absolute inset-0 bg-linear-to-t from-primary-foreground/80 via-primary-foreground/30
 to-transparent"
                  />

                  <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
                    {logoArt ? (
                      <img
                        src={logoArt.replace(".jpg", ".png")}
                        className="h-24 object-contain self-start drop-shadow-lg"
                        alt={`${game.name} logo`}
                      />
                    ) : (
                      <h2 className="text-4xl font-bold drop-shadow-lg">{game.name}</h2>
                    )}

                    <div className="max-w-2xl hidden md:block">
                      <p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">{game.summary}</p>
                    </div>

                    <Link
                      to={"/game/$slug"}
                      params={{ slug: game.id }}
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
          <p className="text-2xl font-bold">{t("common:mostPopular")}</p>
          <Link to={"/game/popular"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {popular?.slice(0, 16).map((game) => {
            const releaseDate = game.firstReleaseDate ? new Date(game.firstReleaseDate) : null;
            const releaseYear =
              releaseDate && !Number.isNaN(releaseDate.getTime()) ? releaseDate.getFullYear() : undefined;

            return (
              <CardItem
                title={game.name}
                url={`/game/${game.igdbId}`}
                imageURL={game.coverUrl}
                rating={game.rating}
                year={releaseYear}
                synopsis={game.summary}
                mediaType={"game"}
                key={game.igdbId}
              />
            );
          })}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:recentlyReleased")}</p>
          <Link to={"/game/recent"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {recentlyReleased?.slice(0, 16).map((game) => {
            const releaseDate = game.firstReleaseDate ? new Date(game.firstReleaseDate) : null;
            const releaseYear =
              releaseDate && !Number.isNaN(releaseDate.getTime()) ? releaseDate.getFullYear() : undefined;

            return (
              <CardItem
                title={game.name}
                url={`/game/${game.igdbId}`}
                imageURL={game.coverUrl}
                rating={game.rating}
                year={releaseYear}
                synopsis={game.summary}
                mediaType={"game"}
                key={game.igdbId}
              />
            );
          })}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:comingSoon")}</p>
          <Link to={"/game/upcoming"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {comingSoon?.slice(0, 16).map((game) => {
            const releaseDate = game.firstReleaseDate ? new Date(game.firstReleaseDate) : null;
            const releaseYear =
              releaseDate && !Number.isNaN(releaseDate.getTime()) ? releaseDate.getFullYear() : undefined;

            return (
              <CardItem
                title={game.name}
                url={`/game/${game.igdbId}`}
                imageURL={game.coverUrl}
                rating={game.rating}
                year={releaseYear}
                synopsis={game.summary}
                mediaType={"game"}
                key={game.igdbId}
              />
            );
          })}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:mostAnticipated")}</p>
          <Link to={"/game/anticipated"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {anticipated?.slice(0, 16).map((game) => {
            const releaseDate = game.firstReleaseDate ? new Date(game.firstReleaseDate) : null;
            const releaseYear =
              releaseDate && !Number.isNaN(releaseDate.getTime()) ? releaseDate.getFullYear() : undefined;

            return (
              <CardItem
                title={game.name}
                url={`/game/${game.igdbId}`}
                imageURL={game.coverUrl}
                rating={game.rating}
                year={releaseYear}
                synopsis={game.summary}
                mediaType={"game"}
                key={game.igdbId}
              />
            );
          })}
        </Grid>
      </div>
    </div>
  );
}

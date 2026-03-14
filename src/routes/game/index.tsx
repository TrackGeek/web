import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { CardItem } from "@/components/shared/cards/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { api } from "@/lib/api.ts";

export const Route = createFileRoute("/game/")({
  component: GameRoute,
});

function GameRoute() {
  const { t } = useTranslation();

  const popularQuery = useQuery({
    queryKey: ["game", "popular"],
    queryFn: () => api.get("/game/top?filter=popular"),
  }).data?.data.topGames;

  const comingQuery = useQuery({
    queryKey: ["game", "coming"],
    queryFn: () => api.get("/game/top?filter=coming"),
  }).data?.data.topGames;

  const antecipatedQuery = useQuery({
    queryKey: ["game", "antecipated"],
    queryFn: () => api.get("/game/top?filter=antecipated"),
  }).data?.data.topGames;

  const recentlyReleasedQuery = useQuery({
    queryKey: ["game", "recentlyReleased"],
    queryFn: () => api.get("/game/top?filter=recentlyReleased"),
  }).data?.data.topGames;

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
          {popularQuery?.slice(0, 3).map((game: any) => {
            const artworks = Array.isArray(game.artworks) ? game.artworks : [];
            const keyArt = artworks.find((a: any) => a.type === "Key art without logo")?.url;
            const logoArt = artworks.find((a: any) => a.type === "Game logo (color)")?.url;

            return (
              <CarouselItem key={game.id}>
                <div className="relative w-full overflow-hidden rounded-xl border border-border">
                  <img
                    src={keyArt || artworks[0]?.url || game.coverUrl}
                    className="w-full h-60 md:h-120 object-cover object-top"
                    alt={game.name}
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/30 to-transparent" />

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
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {popularQuery?.slice(0, 16).map((game: any) => (
            <CardItem
              title={game.name}
              url={`/game/${game.igdbId}`}
              imageURL={game.coverUrl}
              rating={game.rating}
              year={new Date(game.firstReleaseDate).getFullYear()}
              synopsis={game.summary}
              mediaType={"game"}
              key={game.igdbId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:recentlyReleased")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {recentlyReleasedQuery?.slice(0, 16).map((game: any) => (
            <CardItem
              title={game.name}
              url={`/game/${game.igdbId}`}
              imageURL={game.coverUrl}
              rating={game.rating}
              year={new Date(game.firstReleaseDate).getFullYear()}
              synopsis={game.summary}
              mediaType={"game"}
              key={game.igdbId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:comingSoon")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {comingQuery?.slice(0, 16).map((game: any) => (
            <CardItem
              title={game.name}
              url={`/game/${game.igdbId}`}
              imageURL={game.coverUrl}
              rating={game.rating}
              year={new Date(game.firstReleaseDate).getFullYear()}
              synopsis={game.summary}
              mediaType={"game"}
              key={game.igdbId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:mostAnticipated")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {antecipatedQuery?.slice(0, 16).map((game: any) => (
            <CardItem
              title={game.name}
              url={`/game/${game.igdbId}`}
              imageURL={game.coverUrl}
              rating={game.rating}
              year={new Date(game.firstReleaseDate).getFullYear()}
              synopsis={game.summary}
              mediaType={"game"}
              key={game.igdbId}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}

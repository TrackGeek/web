import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { CardItem } from "@/components/shared/cards/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { api } from "@/lib/api";

export const Route = createFileRoute("/anime/")({
  component: AnimeRoute,
});

function AnimeRoute() {
  const { t } = useTranslation();

  const topAiringQuery = useQuery({
    queryKey: ["anime", "top", "airing"],
    queryFn: () => api.get("/anime/top?filter=airing"),
  }).data?.data.animes.items;

  const recommendationsQuery = useQuery({
    queryKey: ["anime", "recommendations"],
    queryFn: () => api.get("/anime/top?filter=bypopularity"),
  }).data?.data.animes.items;

  const comingSoonQuery = useQuery({
    queryKey: ["anime", "top", "comingSoon"],
    queryFn: () => api.get("/anime/top?filter=upcoming"),
  }).data?.data.animes.items;

  const topQuery = useQuery({
    queryKey: ["anime", "top", "anime"],
    queryFn: () => api.get("/anime/top?filter=favorite"),
  }).data?.data.animes.items;

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
          {topAiringQuery?.slice(0, 3).map((anime: any) => {
            const getYoutubeThumbnail = (url: string) => {
              if (!url) return null;
              const match = url.match(/\/embed\/([^/?]+)/);
              const videoId = match ? match[1] : null;
              return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
            };

            const trailerThumbnail = getYoutubeThumbnail(anime.trailerUrl);

            return (
              <CarouselItem key={anime.malId}>
                <div className="relative w-full overflow-hidden rounded-xl border border-border">
                  <img
                    src={trailerThumbnail || anime.imageUrl}
                    className="w-full h-60 md:h-120 object-cover"
                    alt={anime.title}
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/30 to-transparent" />

                  <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
                    <h2 className="text-4xl font-bold drop-shadow-lg">{anime.title}</h2>

                    <div className="max-w-2xl hidden md:block">
                      <p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">{anime.synopsis}</p>
                    </div>

                    <Link
                      to={"/anime/$slug"}
                      params={{ slug: anime.malId }}
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
          <p className="text-2xl font-bold">{t("common:topAiring")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {topAiringQuery?.slice(0, 16).map((anime: any) => (
            <CardItem
              title={anime.title}
              url={`/anime/${anime.malId}`}
              imageURL={anime.imageUrl.replace(
                "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                "/placeholder/cover.webp",
              )}
              rating={+anime.rating}
              year={new Date(anime.airedFrom).getFullYear()}
              synopsis={anime.synopsis}
              mediaType={"anime"}
              key={anime.malId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:recommendations")}</p>{" "}
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {recommendationsQuery?.slice(0, 16).map((anime: any) => (
            <CardItem
              title={anime.title}
              url={`/anime/${anime.malId}`}
              imageURL={anime.imageUrl.replace(
                "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                "/placeholder/cover.webp",
              )}
              rating={+anime.rating}
              year={new Date(anime.airedFrom).getFullYear()}
              synopsis={anime.synopsis}
              mediaType={"anime"}
              key={anime.malId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:comingSoon")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {comingSoonQuery?.slice(0, 16).map((anime: any) => (
            <CardItem
              title={anime.title}
              url={`/anime/${anime.malId}`}
              imageURL={anime.imageUrl.replace(
                "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                "/placeholder/cover.webp",
              )}
              rating={+anime.rating}
              year={new Date(anime.airedFrom).getFullYear()}
              synopsis={anime.synopsis}
              mediaType={"anime"}
              key={anime.malId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:topAnime")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {topQuery?.slice(0, 16).map((anime: any) => (
            <CardItem
              title={anime.title}
              url={`/anime/${anime.malId}`}
              imageURL={anime.imageUrl.replace(
                "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                "/placeholder/cover.webp",
              )}
              rating={+anime.rating}
              year={new Date(anime.airedFrom).getFullYear()}
              synopsis={anime.synopsis}
              mediaType={"anime"}
              key={anime.malId}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}

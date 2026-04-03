import { useQueries } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { CardItem } from "@/components/shared/cards/card";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFeatured } from "@/components/shared/loadings/featured.tsx";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { api, apiEndpoints } from "@/lib/api";
import { seo } from "@/lib/utils/seo.ts";

export const Route = createFileRoute("/anime/")({
  component: AnimeRoute,
  head: () => ({
    meta: [
      ...seo({
        title: "Animes",
        description:
          "Your ultimate anime database. Discover, track, and organize your favorite series and movies. Manage your progress and explore thousands of titles in one place.",
      }),
    ],
  }),
});

function AnimeRoute() {
  const { t } = useTranslation();

  const results = useQueries({
    queries: [
      {
        queryKey: ["anime", "top", "airing"],
        queryFn: () => api.get(apiEndpoints.getAnimeAiring),
      },
      {
        queryKey: ["anime", "recommendations"],
        queryFn: () => api.get(apiEndpoints.getAnimeRecommendations),
      },
      {
        queryKey: ["anime", "top", "comingSoon"],
        queryFn: () => api.get(apiEndpoints.getAnimeComingSoon),
      },
      {
        queryKey: ["anime", "top", "anime"],
        queryFn: () => api.get(apiEndpoints.getAnimeTop),
      },
    ],
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  const [topAiringResult, recommendationsResult, comingSoonResult, topQueryResult] = results;

  const topAiring = topAiringResult.data?.data.animes.items;
  const recommendations = recommendationsResult.data?.data.animes.items;
  const comingSoon = comingSoonResult.data?.data.animes.items;
  const topQuery = topQueryResult.data?.data.animes.items;

  if (isError) return <ErrorComponent />;

  if (isLoading) return <LoadingFeatured />;

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
          {topAiring?.slice(0, 3).map((anime: any) => {
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

                  <div className="absolute inset-0 bg-linear-to-t from-primary-foreground/80 via-primary-foreground/30 to-transparent" />

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
          <Link to={"/anime/airing"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {topAiring?.slice(0, 16).map((anime: any) => (
            <CardItem
              title={anime.title}
              url={`/anime/${anime.malId}`}
              imageURL={
                (anime.imageUrl ?? "").replace(
                  "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                  "/placeholder/cover.webp",
                ) || "/placeholder/cover.webp"
              }
              rating={+anime.rating}
              year={anime.airedFrom ? new Date(anime.airedFrom).getFullYear() : undefined}
              synopsis={anime.synopsis}
              isAdult={anime.isAdult}
              mediaType={"anime"}
              key={anime.malId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:recommendations")}</p>{" "}
          <Link to={"/anime/recommendations"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {recommendations?.slice(0, 16).map((anime: any) => (
            <CardItem
              title={anime.title}
              url={`/anime/${anime.malId}`}
              imageURL={
                (anime.imageUrl ?? "").replace(
                  "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                  "/placeholder/cover.webp",
                ) || "/placeholder/cover.webp"
              }
              rating={+anime.rating}
              year={anime.airedFrom ? new Date(anime.airedFrom).getFullYear() : undefined}
              synopsis={anime.synopsis}
              isAdult={anime.isAdult}
              mediaType={"anime"}
              key={anime.malId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:comingSoon")}</p>
          <Link to={"/anime/upcoming"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {comingSoon?.slice(0, 16).map((anime: any) => (
            <CardItem
              title={anime.title}
              url={`/anime/${anime.malId}`}
              imageURL={
                (anime.imageUrl ?? "").replace(
                  "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                  "/placeholder/cover.webp",
                ) || "/placeholder/cover.webp"
              }
              rating={+anime.rating}
              year={anime.airedFrom ? new Date(anime.airedFrom).getFullYear() : undefined}
              synopsis={anime.synopsis}
              isAdult={anime.isAdult}
              mediaType={"anime"}
              key={anime.malId}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:topAnime")}</p>
          <Link to={"/anime/top"}>
            <Button>{t("pages:donate.viewAll")}</Button>
          </Link>
        </div>
        <Grid minColSize={"128px"} className={"grid-cols-5"}>
          {topQuery?.slice(0, 16).map((anime: any) => (
            <CardItem
              title={anime.title}
              url={`/anime/${anime.malId}`}
              imageURL={
                (anime.imageUrl ?? "").replace(
                  "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                  "/placeholder/cover.webp",
                ) || "/placeholder/cover.webp"
              }
              rating={+anime.rating}
              year={anime.airedFrom ? new Date(anime.airedFrom).getFullYear() : undefined}
              synopsis={anime.synopsis}
              isAdult={anime.isAdult}
              mediaType={"anime"}
              key={anime.malId}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}

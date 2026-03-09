import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx";
import mangas from "@/lib/mockups/mangas.json";

export const Route = createFileRoute("/manga/")({
  component: MangaRoute,
});

function MangaRoute() {
  const { t } = useTranslation();

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
          {mangas.map((manga) => {
            return (
              <CarouselItem key={manga.mal_id}>
                <div className="relative w-full overflow-hidden rounded-xl border border-border">
                  <img
                    src={"/placeholder/banner-1.webp"}
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
                      params={{ slug: manga.mal_id.toString() }}
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
          <p className="text-2xl font-bold">{t("common:topAiring")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"120px"} className={"grid-cols-5"}>
          {mangas.map((manga: any) => (
            <CardItem
              title={manga.title}
              url={`/manga/${manga.id}`}
              imageURL={manga.imageUrl}
              rating={manga.rating}
              year={manga.published.prop.from.year}
              synopsis={manga.synopsis}
              mediaType={"manga"}
              key={manga.id}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:recommendations")}</p>{" "}
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"120px"} className={"grid-cols-5"}>
          {mangas.map((manga: any) => (
            <CardItem
              title={manga.title}
              url={`/manga/${manga.id}`}
              imageURL={manga.imageUrl}
              rating={manga.rating}
              year={manga.published.prop.from.year}
              synopsis={manga.synopsis}
              mediaType={"manga"}
              key={manga.id}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:comingSoon")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"120px"} className={"grid-cols-5"}>
          {mangas.map((manga: any) => (
            <CardItem
              title={manga.title}
              url={`/manga/${manga.id}`}
              imageURL={manga.imageUrl}
              rating={manga.rating}
              year={manga.published.prop.from.year}
              synopsis={manga.synopsis}
              mediaType={"manga"}
              key={manga.id}
            />
          ))}
        </Grid>
        <div className="flex items-center justify-between mb-4">
          <p className="text-2xl font-bold">{t("common:topManga")}</p>
          <Button>{t("pages:donate.viewAll")}</Button>
        </div>
        <Grid minColSize={"120px"} className={"grid-cols-5"}>
          {mangas.map((manga: any) => (
            <CardItem
              title={manga.title}
              url={`/manga/${manga.id}`}
              imageURL={manga.imageUrl}
              rating={manga.rating}
              year={manga.published.prop.from.year}
              synopsis={manga.synopsis}
              mediaType={"manga"}
              key={manga.id}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}

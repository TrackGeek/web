import ViteImage from "@son426/vite-image/react";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, Share } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Filters } from "@/components/layouts/filters.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { LinkTabs, LinkTabsList, LinkTabsTrigger } from "@/components/ui/link-tabs.tsx";
import movies from "@/lib/mockups/movies.json";

export const Route = createFileRoute("/list/$slug")({
  component: ListRoute,
});

type ContentType = "anime" | "manga" | "book" | "game" | "movie" | "tv";

function ListRoute() {
  const { t } = useTranslation();
  const { slug } = Route.useParams();
  const [contentType] = useState<ContentType>("movie");

  const user = {
    avatarUrl: "https://github.com/shadcn.png",
    name: "John Doe",
  };
  return (
    <div className="mx-auto w-full">
      {movies.slice(0, 1).map((movie) => {
        return (
          <div className="relative w-full overflow-hidden rounded-xl border border-border" key={movie.id}>
            <img src={movie.backdropUrl} className="w-full h-60 md:h-100 object-cover" alt={movie.title} />

            <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/30 to-transparent" />
            <Heart className="absolute top-4 right-14 z-10" />
            <Share className="absolute top-4 right-4 z-10" />
            <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
              <h2 className="text-4xl font-bold drop-shadow-lg">{movie.title}</h2>

              <div className="max-w-2xl hidden md:block">
                <p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">{movie.overview}</p>
              </div>
              <div className="flex gap-2 items-center">
                <ViteImage
                  className="aspect-square size-8 rounded-full object-cover"
                  style={{ width: "36px", height: "36px" }}
                  src={{
                    src: user.avatarUrl,
                    blurDataURL: "LKO2:N%2Tw=w]~RBVZRi};RPxuwH",
                    width: 36,
                    height: 36,
                  }}
                />
                <p className="text-sm line-clamp-1 text-gray-300 drop-shadow-md">{user.name}</p>
              </div>
            </div>
          </div>
        );
      })}
      <LinkTabs className={"pt-6"}>
        <LinkTabsList className="flex flex-wrap gap-2 text-sm justify-between w-full">
          <LinkTabsTrigger to={`/list/${slug}`}>{t("common:types.movie_other")}</LinkTabsTrigger>
          <LinkTabsTrigger to={`/list/${`${slug}ba`}`}>{t("common:types.tv_other")}</LinkTabsTrigger>
          <LinkTabsTrigger to={`/list/${`${slug}ca`}`}>{t("common:types.anime_other")}</LinkTabsTrigger>
          <LinkTabsTrigger to={`/list/${`${slug}ja`}`}>Only Japanese</LinkTabsTrigger>
        </LinkTabsList>
      </LinkTabs>
      <div className="flex max-sm:flex-col gap-5 py-6">
        <Filters type={contentType} />
        <Grid minColSize={"120px"} className="flex-1 md:w-2/3 grid gap-6">
          {movies.map((movie) => (
            <CardItem
              title={movie.title}
              url={`/movie/${movie.id}`}
              imageURL={movie.posterUrl}
              rating={0}
              year={new Date(movie.releaseDate).getFullYear()}
              synopsis={movie.overview}
              mediaType={contentType}
              key={movie.id}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}

import { Icon } from "@iconify/react";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { type ContentType, type FilterParams, Filters } from "@/components/layouts/filters.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { LinkTabs, LinkTabsList, LinkTabsTrigger } from "@/components/ui/link-tabs.tsx";
import { AVATAR_BLUR } from "@/lib/image.ts";
import movies from "@/lib/mockups/movies.json";

export const Route = createFileRoute("/list/$slug")({
  component: ListRoute,
});

function ListRoute() {
  const { t } = useTranslation();
  const { slug } = Route.useParams();

  const [contentType] = useState<ContentType>("movie");
  const [filters, setFilters] = useState<FilterParams>({});

  const handleFilterChange = useCallback((patch: Partial<FilterParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const user = {
    avatarUrl: "https://github.com/shadcn.png",
    name: "John Doe",
  };
  return (
    <div className="mx-auto w-full">
      {movies.slice(0, 1).map((movie) => {
        return (
          <div className="relative w-full overflow-hidden rounded-xl border border-border" key={movie.id}>
            <Image
              src={movie.backdropUrl}
              layout="fullWidth"
              aspectRatio={16 / 9}
              className="w-full h-60 md:h-100 object-cover"
              alt={movie.title}
            />

            <div
              className="absolute inset-0 bg-linear-to-t from-primary-foreground/80 via-primary-foreground/30
 to-transparent"
            />
            <Icon icon={"lucide:heart"} className="absolute top-4 right-14 z-10" />
            <Icon icon={"lucide:share"} className="absolute top-4 right-4 z-10" />
            <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
              <h2 className="text-4xl font-bold drop-shadow-lg">{movie.title}</h2>

              <div className="max-w-2xl hidden md:block">
                <p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">{movie.overview}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Image
                  className="aspect-square size-8 rounded-full object-cover"
                  src={user.avatarUrl}
                  width={36}
                  height={36}
                  background={AVATAR_BLUR}
                  alt={user.name}
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
        <Filters values={filters} onChange={handleFilterChange} type={contentType} />
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

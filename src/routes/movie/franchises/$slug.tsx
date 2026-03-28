import { createFileRoute } from "@tanstack/react-router";
import { Heart, Share } from "lucide-react";
import { useCallback, useState } from "react";
import { type FilterParams, Filters } from "@/components/layouts/filters.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import movies from "@/lib/mockups/movies.json";

export const Route = createFileRoute("/movie/franchises/$slug")({
  component: MovieFranchiseRoute,
});

function MovieFranchiseRoute() {
  const [filters, setFilters] = useState<FilterParams>({});

  const { slug: _ } = Route.useParams();

  const handleFilterChange = useCallback((patch: Partial<FilterParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  return (
    <div className="mx-auto w-full">
      {movies.slice(0, 1).map((movie) => {
        return (
          <div className="relative w-full overflow-hidden rounded-xl border border-border" key={movie.id}>
            <img src={movie.backdropUrl} className="w-full h-60 md:h-100 object-cover" alt={movie.title} />

            <div
              className="absolute inset-0 bg-linear-to-t from-primary-foreground/80 via-primary-foreground/30
 to-transparent"
            />
            <Heart className="absolute top-4 right-14 z-10" />
            <Share className="absolute top-4 right-4 z-10" />
            <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
              <h2 className="text-4xl font-bold drop-shadow-lg">{movie.title}</h2>

              <div className="max-w-2xl hidden md:block">
                <p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">{movie.overview}</p>
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex max-sm:flex-col gap-5 py-6">
        <Filters values={filters} onChange={handleFilterChange} type={"movie"} />
        <Grid minColSize={"120px"} className={"grid-cols-5"}>
          {movies.map((movie) => (
            <CardItem
              title={movie.title}
              url={`/movie/${movie.id}`}
              imageURL={movie.posterUrl}
              rating={0}
              year={movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined}
              synopsis={movie.overview}
              mediaType={"movie"}
              key={movie.id}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}

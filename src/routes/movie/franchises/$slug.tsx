import { createFileRoute } from "@tanstack/react-router";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import movies from "@/lib/mockups/movies.json";

export const Route = createFileRoute("/movie/franchises/$slug")({
  component: MovieFranchiseRoute,
});

function MovieFranchiseRoute() {
  const { slug: _ } = Route.useParams();

  return (
    <div className="mx-auto w-full">
      {movies.slice(0, 1).map((movie) => {
        return (
          <div className="relative w-full overflow-hidden rounded-xl border border-border" key={movie.id}>
            <img src={movie.backdropUrl} className="w-full h-60 md:h-100 object-cover" alt={movie.title} />

            <div className="absolute inset-0 bg-linear-to-t from-malachite-500/80 via-malachite-500/30 to-transparent" />

            <div className="absolute inset-0 p-8 flex flex-col justify-end gap-4">
              <h2 className="text-4xl font-bold drop-shadow-lg">{movie.title}</h2>

              <div className="max-w-2xl hidden md:block">
                <p className="text-lg line-clamp-2 text-white/90 drop-shadow-md">{movie.overview}</p>
              </div>
            </div>
          </div>
        );
      })}
      <Grid minColSize={"120px"} className={"grid-cols-5 py-6"}>
        {movies.map((movie) => (
          <CardItem
            title={movie.title}
            url={`/movie/${movie.id}`}
            imageURL={movie.posterUrl}
            rating={0}
            year={new Date(movie.releaseDate).getFullYear()}
            synopsis={movie.overview}
            mediaType={"movie"}
            key={movie.id}
          />
        ))}
      </Grid>
    </div>
  );
}

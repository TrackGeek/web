import { createFileRoute } from "@tanstack/react-router";
import { Heart, Share } from "lucide-react";
import { Filters } from "@/components/layouts/filters.tsx";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import gamesData from "@/lib/mockups/games.json";

export const Route = createFileRoute("/game/franchises/$slug")({
  component: GameFranchiseRoute,
});

function GameFranchiseRoute() {
  const { slug: _ } = Route.useParams();
  const games = Array.isArray(gamesData) ? gamesData : [gamesData.game];

  return (
    <div className="mx-auto w-full">
      {games.map((game) => {
        const artworks = Array.isArray(game.artworks) ? game.artworks : [];
        const keyArt = artworks.find((a: any) => a.type === "Key art without logo")?.url;

        return (
          <div className="relative w-full overflow-hidden rounded-xl border border-border" key={game.id}>
            <img
              src={keyArt || game.coverUrl}
              className="w-full h-60 md:h-100 object-cover object-top"
              alt={game.name}
            />

            <div className="absolute inset-0 bg-linear-to-t from-primary/80 via-primary/30 to-transparent" />
            <Heart className="absolute top-4 right-14 z-10" />
            <Share className="absolute top-4 right-4 z-10" />
            <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-end gap-4">
              <h2 className="text-4xl font-bold drop-shadow-lg">{game.name}</h2>
            </div>
          </div>
        );
      })}
      <div className="flex max-sm:flex-col gap-5 py-6">
        <Filters type={"game"} />
        <Grid minColSize={"120px"} className={"grid-cols-5"}>
          {games.map((game) => (
            <CardItem
              title={game.name}
              url={`/game/${game.id}`}
              imageURL={game.coverUrl}
              rating={game.rating}
              year={new Date(game.releaseDates[0].date).getFullYear()}
              synopsis={game.summary}
              mediaType={"game"}
              key={game.id}
            />
          ))}
        </Grid>
      </div>
    </div>
  );
}

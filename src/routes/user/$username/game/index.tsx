import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, Dices, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { UserLayout } from "@/components/layouts/user";
import { CardItem } from "@/components/shared/cards/card";
import { GameModes } from "@/components/shared/filters/game-modes.tsx";
import { Genres } from "@/components/shared/filters/genre.tsx";
import { Sort } from "@/components/shared/filters/sort.tsx";
import { Status } from "@/components/shared/filters/status.tsx";
import { Year } from "@/components/shared/filters/year.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { List } from "@/components/ui/list";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/user/$username/game/")({
  head: () => ({
    meta: [...seo({ title: "Game List" })],
  }),
  component: GameListRoute,
});

export function GameListRoute() {
  const { username } = Route.useParams();
  const { t } = useTranslation();

  const user = {
    username,
    avatarUrl: "https://github.com/Kuriel23.png",
    bio: "Apaixonada por anime, leitora ávida e avaliadora. Gosto de slice-of-life e sci-fi. Escrevo reviews detalhadas e listas de favoritos.",
    followers: 324,
    following: 48,
  };

  const medals = [
    {
      id: "m1",
      name: "Top Reviewer",
      description: "100+ reviews and highly rated",
    },
    {
      id: "m2",
      name: "Marathon Watcher",
      description: "1000+ episodes watched",
    },
    { id: "m3", name: "Community Helper", description: "10 helpful reviews" },
    { id: "m3", name: "Community Helper", description: "10 helpful reviews" },
  ];

  const game = [
    { id: "a1", title: "Attack on Titan", image: "/favicon.svg", score: 9 },
    { id: "a2", title: "Steins;Gate", image: "/logo.svg", score: 9.5 },
    { id: "a3", title: "Cowboy Bebop", image: "/logo.svg", score: 9.3 },
  ];

  return (
    <UserLayout user={user} medalsCount={medals.length} entriesCount={5}>
      <div className="flex max-sm:flex-col gap-5">
        <div className="w-full md:w-1/4 flex flex-col gap-6">
          <div className="bg-card rounded-2xl shadow-lg p-6 gap-4 flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold text-card-foreground">{t("user:filter")}</h4>
              <Button>
                <Dices className={"size-5"} />
              </Button>
            </div>
            <Input placeholder={`${t("user:search")}...`} className="bg-muted/50" />
            <div className="flex items-center justify-between">
              <h5 className="text-md font-semibold text-card-foreground">{t("feed:customLists")}</h5>
              <div className={"flex gap-2"}>
                <ArrowLeftRight className={"size-5 cursor-pointer"} />
                <Plus className={"size-5 cursor-pointer"} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {[
                t("feed:lists.planning"),
                t("feed:lists.playing"),
                t("feed:lists.replaying"),
                t("feed:lists.completed"),
                "Planning with my love",
                "2️⃣0️⃣2️⃣6️⃣",
                t("feed:lists.dropped"),
              ].map((listName) => (
                <List key={listName} name={listName} active={listName === t("feed:lists.planning")} />
              ))}
            </div>
            <Status type={"game"} />
            <Genres type={"game"} />
            <Year type={"game"} />
            <Sort />
            <GameModes />
          </div>
        </div>
        <Grid minColSize={"128px"} className="flex-1 md:w-2/3 grid grid-cols-1 gap-6">
          {game.map((f) => (
            <CardItem
              key={f.id}
              title={f.title}
              url={"/"}
              imageURL={f.image}
              rating={f.score ?? 0}
              year={2025}
              synopsis={f.title}
              mediaType={"game"}
            />
          ))}
        </Grid>
      </div>
    </UserLayout>
  );
}

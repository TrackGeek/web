import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, Dices, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CardItem } from "@/components/shared/cards/card";
import { Grid } from "@/components/layouts/grid";
import { UserLayout } from "@/components/layouts/user";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { List } from "@/components/ui/list";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { getGenreLabel } from "@/lib/utils/genre-utils";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/user/$username/serie/")({
  head: () => ({
    meta: [...seo({ title: "Serie List" })],
  }),
  component: SerieListRoute,
});

export function SerieListRoute() {
  const { username } = Route.useParams();
  const { t } = useTranslation();

  const genres = [
    "Action & Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Kids",
    "Mystery",
    "News",
    "Reality",
    "Sci-Fi & Fantasy",
    "Soap",
    "Talk",
    "War & Politics",
    "Western",
  ];

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

  const serie = [
    { id: "a1", title: "Attack on Titan", image: "/tv.svg", score: 9 },
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
            <Input placeholder={`${t(`user:search`)}...`} className="bg-muted/50" />
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
                t("feed:lists.watching"),
                t("feed:lists.rewatching"),
                t("feed:lists.completed"),
                "Planning with my love",
                "2️⃣0️⃣2️⃣6️⃣",
                t("feed:lists.dropped"),
              ].map((listName) => (
                <List key={listName} name={listName} active={listName === t("feed:lists.planning")} />
              ))}
            </div>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("library:status")} className="w-full" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"notYetAired"}>{t("library:statusAir.notYetAired")}</SelectItem>
                  <SelectItem value={"currentlyAiring"}>{t("library:statusAir.currentlyAiring")}</SelectItem>
                  <SelectItem value={"finishedAiring"}>{t("library:statusAir.finishedAiring")}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>{" "}
            <div className="flex flex-col gap-2 gap-y-4">
              <p>{t("library:runtime")}</p>
              <Slider defaultValue={[1, 400]} max={400} step={30} />
              <div className="w-full justify-between flex gap-2">
                <Input type={"number"} defaultValue={1} min={1} max={400} className={"w-16"} />
                <Input type={"number"} defaultValue={400} className={"w-16"} min={1} max={400} />
              </div>
            </div>
            <Combobox items={genres} multiple={true}>
              <ComboboxInput placeholder={t("library:genres")} showClear readOnly={true} />
              <ComboboxContent>
                <ComboboxList>
                  {genres.map((genre) => (
                    <ComboboxItem key={genre} value={genre} className={"capitalize"}>
                      {getGenreLabel(t, genre)}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Input type={"number"} placeholder={`${t(`library:year`)}`} min={1958} max={new Date().getFullYear() + 2} />
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("user:sort.placeholder")} className="w-full" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"title"}>{t("user:sort.title")}</SelectItem>
                  <SelectItem value={"lastAdded"}>{t("user:sort.lastAdded")}</SelectItem>
                  <SelectItem value={"lastUpdated"}>{t("user:sort.lastUpdated")}</SelectItem>
                  <SelectItem value={"rating"}>{t("user:sort.rating")}</SelectItem>
                  <SelectItem value={"releaseDate"}>{t("user:sort.releaseDate")}</SelectItem>
                  <SelectItem value={"popularity"}>{t("user:sort.popularity")}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Grid minColSize={"128px"} className="flex-1 md:w-2/3 grid grid-cols-1 gap-6">
          {serie.map((f) => (
            <CardItem
              key={f.id}
              title={f.title}
              url={"/"}
              imageURL={f.image}
              rating={f.score ?? 0}
              year={2025}
              synopsis={f.title}
              mediaType={"tv-show"}
            />
          ))}
        </Grid>
      </div>
    </UserLayout>
  );
}

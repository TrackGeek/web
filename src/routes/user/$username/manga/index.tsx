import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, Dices, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { UserLayout } from "@/components/layouts/user";
import { CardItem } from "@/components/shared/cards/card";
import { Genres } from "@/components/shared/filters/genre.tsx";
import { MinReading } from "@/components/shared/filters/min-reading.tsx";
import { Sort } from "@/components/shared/filters/sort.tsx";
import { Status } from "@/components/shared/filters/status.tsx";
import { Year } from "@/components/shared/filters/year.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { List } from "@/components/ui/list";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/user/$username/manga/")({
  head: () => ({
    meta: [...seo({ title: "Manga List" })],
  }),
  component: MangaListRoute,
});

export function MangaListRoute() {
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

  const anime = [
    { id: "m1", title: "Berserk", image: "/logo.svg", score: 9.2 },
    { id: "m1", title: "Berserk", image: "/logo.svg", score: 9.2 },
    { id: "m1", title: "Berserk", image: "/logo.svg", score: 9.2 },
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
                t("feed:lists.reading"),
                t("feed:lists.rereading"),
                t("feed:lists.completed"),
                "Planning with my love",
                "2️⃣0️⃣2️⃣6️⃣",
                t("feed:lists.dropped"),
              ].map((listName) => (
                <List key={listName} name={listName} active={listName === t("feed:lists.planning")} />
              ))}
            </div>
            <div>
              <h5 className="text-md font-semibold text-card-foreground mb-2">{t("feed:format")}</h5>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("feed:format")} className="w-full" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={"manga"}>{t("common:types.manga")}</SelectItem>
                    <SelectItem value={"manhwa"}>{t("library:types.Manhwa")}</SelectItem>
                    <SelectItem value={"manhua"}>{t("library:types.Manhua")}</SelectItem>
                    <SelectItem value={"novel"}>{t("library:types.Novel")}</SelectItem>
                    <SelectItem value={"lightNovel"}>{t("library:types.LightNovel")}</SelectItem>
                    <SelectItem value={"oneshot"}>{t("library:types.OneShot")}</SelectItem>
                    <SelectItem value={"doujinshi"}>{t("library:types.Doujinshi")}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Status type={"manga"} />
            <Genres type={"manga"} />
            <Year type={"manga"} />
            <MinReading type={"manga"} />
            <Sort />
          </div>
        </div>
        <Grid minColSize={"128px"} className="flex-1 md:w-2/3 grid grid-cols-1 gap-6">
          {anime.map((f) => (
            <CardItem
              key={f.id}
              title={f.title}
              url={"/"}
              imageURL={f.image}
              rating={f.score ?? 0}
              year={2025}
              synopsis={f.title}
              mediaType={"manga"}
            />
          ))}
        </Grid>
      </div>
    </UserLayout>
  );
}

import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid";
import { CardItem } from "@/components/shared/cards/card";
import { Genres } from "@/components/shared/filters/genre.tsx";
// import { MinEpisodes } from "@/components/shared/filters/min-episodes.tsx";
import { Sort } from "@/components/shared/filters/sort.tsx";
import { Status } from "@/components/shared/filters/status.tsx";
import { Year } from "@/components/shared/filters/year.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { List } from "@/components/ui/list";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function UserAnimeTab() {
  const { t } = useTranslation();

  const anime = [
    { id: "a1", title: "Attack on Titan", image: "/favicon.svg", score: 9 },
    { id: "a2", title: "Steins;Gate", image: "/logo.svg", score: 9.5 },
    { id: "a3", title: "Cowboy Bebop", image: "/logo.svg", score: 9.3 },
  ];

  return (
    <div className="flex max-sm:flex-col gap-5">
      <div className="w-full md:w-1/4 flex flex-col gap-6">
        <div className="bg-card rounded-2xl shadow-lg p-6 gap-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-semibold text-card-foreground">{t("user:filter")}</h4>
            <Button>
              <Icon icon={"lucide:dices"} className={"size-5"} />
            </Button>
          </div>
          <Input placeholder={`${t("user:search")}...`} className="bg-muted/50" />
          <div className="flex items-center justify-between">
            <h5 className="text-md font-semibold text-card-foreground">{t("feed:customLists")}</h5>
            <div className={"flex gap-2"}>
              <Icon icon={"lucide:arrow-left-right"} className={"size-5 cursor-pointer"} />
              <Icon icon={"lucide:plus"} className={"size-5 cursor-pointer"} />
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
          <div>
            <h5 className="text-md font-semibold text-card-foreground mb-2">{t("feed:format")}</h5>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("feed:format")} className="w-full" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={"tv"}>TV</SelectItem>
                  <SelectItem value={"movie"}>{t("common:types.movie")}</SelectItem>
                  <SelectItem value={"ova"}>OVA</SelectItem>
                  <SelectItem value={"ona"}>ONA</SelectItem>
                  <SelectItem value={"special"}>{t("library:types.Special")}</SelectItem>
                  <SelectItem value={"TVSpecial"}>{t("library:types.TVSpecial")}</SelectItem>
                  <SelectItem value={"music"}>{t("library:types.Music")}</SelectItem>
                  <SelectItem value={"cm"}>CM</SelectItem>
                  <SelectItem value={"pv"}>PV</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Status type={"anime"} />
          <Genres type={"anime"} />
          <Year type={"anime"} />
          {
            //<MinEpisodes />
          }
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
            mediaType={"anime"}
          />
        ))}
      </Grid>
    </div>
  );
}

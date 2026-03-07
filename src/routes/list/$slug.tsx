import ViteImage from "@son426/vite-image/react";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, Share } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CardItem } from "@/components/shared/cards/card.tsx";
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox.tsx";
import { Input } from "@/components/ui/input.tsx";
import { LinkTabs, LinkTabsList, LinkTabsTrigger } from "@/components/ui/link-tabs.tsx";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import movies from "@/lib/mockups/movies.json";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";

export const Route = createFileRoute("/list/$slug")({
  component: ListRoute,
});

type ContentType = "anime" | "manga" | "book" | "game" | "movie" | "tv";

const GENRE_CONFIG: Record<ContentType, string[]> = {
  anime: [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Isekai",
    "Mahou Shoujo",
    "Mecha",
    "Music",
    "Mystery",
    "Psychological",
    "Romance",
    "School",
    "Sci-Fi",
    "Shoujo",
    "Shounen",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Thriller",
  ],
  manga: [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Historical",
    "Horror",
    "Isekai",
    "Josei",
    "Martial Arts",
    "Mecha",
    "Mystery",
    "Romance",
    "School",
    "Sci-Fi",
    "Shoujo",
    "Shounen",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Thriller",
  ],
  book: [
    "Action",
    "Adventure",
    "Biography",
    "Comedy",
    "Crime",
    "Drama",
    "Fantasy",
    "Historical",
    "Horror",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Self-Help",
    "Thriller",
    "Young Adult",
  ],
  game: [
    "Pinball",
    "Adventure",
    "Indie",
    "Arcade",
    "Visual Novel",
    "Card & Board Game",
    "MOBA",
    "Point-and-click",
    "Fighting",
    "Shooter",
    "Music",
    "Platform",
    "Puzzle",
    "Racing",
    "Real Time Strategy (RTS)",
    "Role-playing (RPG)",
    "Simulator",
    "Sport",
    "Strategy",
    "Turn-based Strategy (TBS)",
    "Tactical",
    "Hack and slash/Beat em up",
    "Quiz/Trivia",
  ],
  movie: [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Fantasy",
    "Film-Noir",
    "Horror",
    "Musical",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Sport",
    "Thriller",
    "War",
    "Western",
  ],
  tv: [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Sport",
    "Talk-Show",
    "Thriller",
    "War",
    "Western",
  ],
};

const YEAR_RANGES: Record<ContentType, { min: number; max: number }> = {
  anime: { min: 1958, max: new Date().getFullYear() + 2 },
  manga: { min: 1858, max: new Date().getFullYear() + 2 },
  book: { min: -3000, max: new Date().getFullYear() },
  game: { min: 1958, max: new Date().getFullYear() + 2 },
  movie: { min: 1888, max: new Date().getFullYear() + 2 },
  tv: { min: 1927, max: new Date().getFullYear() + 2 },
};

const STATUS_OPTIONS: Record<ContentType, { value: string; labelKey: string }[]> = {
  anime: [
    { value: "notYetAired", labelKey: "library:statusAir.notYetAired" },
    { value: "currentlyAiring", labelKey: "library:statusAir.currentlyAiring" },
    { value: "finishedAiring", labelKey: "library:statusAir.finishedAiring" },
  ],
  manga: [
    { value: "notYetPublished", labelKey: "library:statusAir.notYetPublished" },
    { value: "publishing", labelKey: "library:statusAir.publishing" },
    { value: "finished", labelKey: "library:statusAir.finished" },
    { value: "onHiatus", labelKey: "library:statusAir.onHiatus" },
    { value: "discontinued", labelKey: "library:statusAir.discontinued" },
  ],
  book: [
    { value: "released", labelKey: "library:statusAir.released" },
    { value: "unreleased", labelKey: "library:statusAir.unreleased" },
  ],
  game: [
    { value: "released", labelKey: "library:statusAir.released" },
    { value: "unreleased", labelKey: "library:statusAir.unreleased" },
  ],
  movie: [
    { value: "released", labelKey: "library:statusAir.released" },
    { value: "unreleased", labelKey: "library:statusAir.unreleased" },
  ],
  tv: [
    { value: "notYetAired", labelKey: "library:statusAir.notYetAired" },
    { value: "currentlyAiring", labelKey: "library:statusAir.currentlyAiring" },
    { value: "finishedAiring", labelKey: "library:statusAir.finishedAiring" },
  ],
};

const SORT_OPTIONS = [
  { value: "title", labelKey: "user:sort.title" },
  { value: "lastAdded", labelKey: "user:sort.lastAdded" },
  { value: "lastUpdated", labelKey: "user:sort.lastUpdated" },
  { value: "rating", labelKey: "user:sort.rating" },
  { value: "releaseDate", labelKey: "user:sort.releaseDate" },
  { value: "popularity", labelKey: "user:sort.popularity" },
];

function ListRoute() {
  const { t } = useTranslation();
  const { slug } = Route.useParams();
  const [contentType] = useState<ContentType>("movie");

  const currentGenres = GENRE_CONFIG[contentType];
  const currentStatus = STATUS_OPTIONS[contentType];
  const yearRange = YEAR_RANGES[contentType];

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
        <div className="w-full md:w-1/4 flex flex-col gap-6">
          <div className="bg-card rounded-2xl shadow-lg p-6 gap-4 flex flex-col">
            <h5 className="text-md font-semibold text-card-foreground">{t("user:filter")}</h5>

            <div>
              <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:status")}</h5>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("library:status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {currentStatus.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:genres")}</h5>
              <Combobox items={currentGenres} multiple={true}>
                <ComboboxInput placeholder={t("library:genres")} showClear readOnly={true} />
                <ComboboxContent>
                  <ComboboxList>
                    {currentGenres.map((genre) => (
                      <ComboboxItem key={genre} value={genre}>
                        {getGenreLabel(t as any, genre)}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div>
              <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:year")}</h5>
              <Input
                type="number"
                placeholder={t("library:year")}
                min={yearRange.min}
                max={yearRange.max}
                className="bg-muted/50"
              />
            </div>

            <div>
              <h5 className="text-md font-semibold text-card-foreground mb-2">{t("user:sort.placeholder")}</h5>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("user:sort.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {contentType === "game" && (
              <>
                <div>
                  <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:gameModes")}</h5>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("library:gameModes")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="cooperative">{t("library:gameModesList.cooperative")}</SelectItem>
                        <SelectItem value="singleplayer">{t("library:gameModesList.singleplayer")}</SelectItem>
                        <SelectItem value="multiplayer">{t("library:gameModesList.multiplayer")}</SelectItem>
                        <SelectItem value="mmo">{t("library:gameModesList.massivelyMultiplayerOnline")}</SelectItem>
                        <SelectItem value="battleRoyale">{t("library:gameModesList.battleRoyale")}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:platforms")}</h5>
                  <Combobox
                    items={["PC", "PlayStation 5", "Xbox Series X|S", "Nintendo Switch", "iOS", "Android"]}
                    multiple={true}
                  >
                    <ComboboxInput placeholder={t("library:platforms")} showClear readOnly={true} />
                    <ComboboxContent>
                      <ComboboxList>
                        {["PC", "PlayStation 5", "Xbox Series X|S", "Nintendo Switch", "iOS", "Android"].map(
                          (platform) => (
                            <ComboboxItem key={platform} value={platform}>
                              {platform}
                            </ComboboxItem>
                          ),
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              </>
            )}

            {(contentType === "anime" || contentType === "tv") && (
              <div>
                <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:episode_other")}</h5>
                <Input type="number" placeholder={t("common:minEpisodes")} min={0} className="bg-muted/50" />
              </div>
            )}

            {(contentType === "manga" || contentType === "book") && (
              <div>
                <h5 className="text-md font-semibold text-card-foreground mb-2">{t("library:chapters")}</h5>
                <Input type="number" placeholder={t("common:minChapters")} min={0} className="bg-muted/50" />
              </div>
            )}
          </div>
        </div>
        <Grid minColSize={"120px"} className="flex-1 md:w-2/3 grid gap-6">
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
    </div>
  );
}

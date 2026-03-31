import {
  SiFacebook,
  SiFacebookHex,
  SiInstagram,
  SiInstagramHex,
  SiMyanimelist,
  SiWikipedia,
  SiWikipediaHex,
  SiX,
} from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Antenna,
  Bookmark,
  Building,
  Building2,
  CheckCircle,
  CheckSquare,
  Clock,
  ExternalLink,
  FilePenLine,
  Hash,
  Heart,
  Languages,
  MoreHorizontal,
  Star,
  TvIcon,
  TvMinimalPlay,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { AnimeEpisodeProgress, type SingleSeasonData } from "@/components/pages/details/anime-progress";
import { CastItem } from "@/components/pages/details/cast";
import { CharacterItem } from "@/components/pages/details/character";
import { EpisodeItem } from "@/components/pages/details/episode";
import { ListItem } from "@/components/pages/details/list";
import { Relations } from "@/components/pages/details/relations";
import { ReviewItem } from "@/components/pages/details/review";
import { DetailsCard } from "@/components/shared/cards/details";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { EpisodicContentModal } from "@/components/shared/modals/episodic-content";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { cn } from "@/lib/utils";
import { getGenreLabel } from "@/lib/utils/genre-utils";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/anime/$slug")({
  loader: async ({ params }) => {
    const anime = await api.get(`/anime/detail/${params.slug}`).then(({ data }) => data.anime);
    return { anime };
  },
  head: ({ loaderData }) => {
    const anime = loaderData?.anime;
    return {
      meta: [
        ...seo({
          title: anime?.title ? anime.title : "Anime Details",
          description: anime?.synopsis ?? undefined,
          image: anime?.imageUrl ?? undefined,
        }),
      ],
    };
  },
  component: AnimeDetailsRoute,
  errorComponent: ErrorComponent,
});

function AnimeDetailsRoute() {
  const { slug } = Route.useParams();
  const { anime: loaderAnime } = Route.useLoaderData();
  const { t } = useTranslation();
  const [mySeason, _setMySeason] = useState<SingleSeasonData>({
    totalEpisodes: 12,
    watchedEpisodes: [1, 2, 3, 4, 5],
  });
  const rating = 4.2;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["anime", slug],
    queryFn: () => api.get(`/anime/detail/${slug}`).then(({ data }) => data.anime),
    initialData: loaderAnime,
  });
  const anime = data;

  const episodesData = useQuery({
    queryKey: ["animeEpisodes", slug],
    queryFn: () => api.get(`/anime/detail/${slug}/episode`).then(({ data }) => data.episodes.items),
  });
  const episodes = episodesData?.data;

  const reviewsData = useQuery({
    queryKey: ["animeReviews", slug],
    queryFn: () => api.get(`/anime/review/?animeId=${slug}`).then(({ data }) => data.animeReviews),
  });
  const reviews = reviewsData?.data;

  function handleToggle(ep: number) {
    console.log(ep);
  }

  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  if (isLoading) return <LoadingDetails />;
  if (isError || !anime) return <ErrorComponent />;
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3">
        <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 flex flex-col gap-4">
          <div className="w-full mx-auto shadow-xl rounded-lg overflow-hidden">
            <img
              src={anime.imageUrl || "/placeholder/cover.webp"}
              alt="Capa do anime"
              className="w-full h-auto object-cover"
            />
          </div>

          {isAuthenticated && (
            <>
              <div className="grid grid-cols-3 w-full gap-4">
                <button
                  type="button"
                  className="w-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-purple-400 transition-all duration-300 bg-card hover:bg-purple-400/20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-10 rounded-full bg-linear-to-r from-purple-500/20 to-violet-500/20 flex items-center justify-center border border-purple-500/30">
                      <Bookmark className="text-purple-400" />
                    </div>
                    <p className="font-medium text-card-foreground text-center">{t("feed:lists.planning")}</p>
                  </div>
                  <div className="status-indicator hidden">
                    <CheckCircle className="size-6 text-secondary" />
                  </div>
                </button>

                <button
                  type="button"
                  className="w-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 bg-card hover:bg-primary/20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-10 rounded-full bg-linear-to-r from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                      <TvMinimalPlay className="text-primary" />
                    </div>
                    <p className="font-medium text-card-foreground text-center">{t("feed:lists.watching")}</p>
                  </div>
                  <div className="status-indicator hidden">
                    <CheckCircle className="size-6 text-secondary" />
                  </div>
                </button>

                <button
                  type="button"
                  className="w-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-chart-3 transition-all duration-300 bg-card hover:bg-chart-3/20"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-10 rounded-full bg-linear-to-r from-chart-3/20 to-amber-500/20 flex items-center justify-center border border-chart-3/30">
                      <CheckSquare className="text-chart-3" />
                    </div>
                    <p className="font-medium text-card-foreground text-center">{t("feed:lists.completed")}</p>
                  </div>
                  <div className="status-indicator hidden">
                    <CheckCircle className="size-6 text-secondary" />
                  </div>
                </button>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex bg-transparent items-center justify-center gap-2 w-full py-3 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-all duration-300">
                    <MoreHorizontal className="size-5" />
                    <span className="text-sm font-medium">{t("library:moreOptions")}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden p-0">
                  <DialogHeader
                    className="h-48 p-0 flex flex-row items-center bg-cover bg-center px-6 relative"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url("${anime.imageUrl || "/placeholder/cover.webp"}")`,
                    }}
                  >
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
                    <div className="flex flex-row items-center w-full">
                      <img
                        src={anime.imageUrl || "/placeholder/cover.webp"}
                        alt="Cover"
                        className="w-28 h-40 object-cover rounded-lg shadow-2xl relative z-10 border-2 border-white/30"
                      />
                      <div className="flex-1 px-6 relative z-10 space-y-2">
                        <DialogTitle className="text-white font-bold text-2xl drop-shadow-lg">
                          {anime.title}
                        </DialogTitle>
                        <div className="flex items-center gap-4 text-white/90 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="size-4 fill-yellow-400 text-yellow-400" />
                            <span>{rating}</span>
                          </div>
                          <span>•</span>
                          {anime.season && anime.year && <span>{`${anime.season} ${anime.year}`}</span>}
                        </div>
                        <p className="text-white/80 text-sm max-w-md line-clamp-2">{anime.synopsis}</p>
                      </div>
                    </div>

                    <div className="absolute z-50 top-[45%] right-10 flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                        <Heart className="size-6" />
                      </Button>
                    </div>
                  </DialogHeader>

                  <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
                    <EpisodicContentModal />
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          <div className="border-t border-border" />

          <Grid minColSize={"128px"} className="gap-4">
            {anime.status && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">{t("library:status")}</p>
                <p className="font-semibold text-card-foreground">{anime.status}</p>
              </div>
            )}
            {anime.season && anime.year && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">{t("library:releaseDate")}</p>
                <p className="font-semibold text-card-foreground capitalize">{`${anime.season} ${anime.year}`}</p>
              </div>
            )}
          </Grid>
          <RefreshData sourceURL={`https://myanimelist.net/anime/${anime.malId}`} />
          {anime.external.length >= 1 && (
            <div className="flex flex-wrap gap-3 items-center justify-center">
              {(() => {
                const extArr = anime.external || [];
                const links: any[] = [];

                extArr.forEach((e: { url: string; name: string }, i: number) => {
                  const name = (e.name || "").toLowerCase();
                  const url = e.url;

                  if (/official/i.test(name)) {
                    links.push({ href: url, key: `official-${i}`, icon: <ExternalLink /> });
                    return;
                  }

                  if (name.includes("instagram")) {
                    links.push({
                      href: url,
                      key: `instagram-${i}`,
                      className: cn(`hover:text-[${SiInstagramHex}]`),
                      icon: <SiInstagram />,
                    });
                    return;
                  }

                  if (name.includes("facebook")) {
                    links.push({
                      href: url,
                      key: `facebook-${i}`,
                      className: cn(`hover:text-[${SiFacebookHex}]`),
                      icon: <SiFacebook />,
                    });
                    return;
                  }

                  if (name.startsWith("@")) {
                    links.push({ href: url, key: `twitter-${i}`, className: cn("hover:text-white"), icon: <SiX /> });
                    return;
                  }

                  if (name.includes("ann")) {
                    links.push({
                      href: url,
                      key: `ann-${i}`,
                      icon: <img src={"/icons/ann.svg"} alt={"ANN Logo"} className="size-6" />,
                    });
                    return;
                  }

                  if (name.includes("wikipedia")) {
                    links.push({
                      href: url,
                      key: `wikipedia-${i}`,
                      className: cn(`hover:text-[${SiWikipediaHex}]`),
                      icon: <SiWikipedia />,
                    });
                    return;
                  }

                  links.push({ href: url, key: `link-${i}`, icon: <ExternalLink /> });
                });

                if (anime.malId) {
                  links.push({
                    href: `https://myanimelist.net/anime/${anime.malId}`,
                    key: "mal",
                    icon: <SiMyanimelist />,
                  });
                }

                return links.map((l) => (
                  <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" className={l.className}>
                    {l.icon}
                  </a>
                ));
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="lg:w-2/3">
        <div className="bg-card rounded-2xl shadow-lg p-8 space-y-3">
          <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
            {anime.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 border-b border-border pb-5">
            {!reviewsData.isLoading && !reviewsData.isError && reviews.total >= 1 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  <Star className="size-5 text-chart-3 fill-chart-3" />
                  <Star className="size-5 text-chart-3 fill-chart-3" />
                  <Star className="size-5 text-chart-3 fill-chart-3" />
                  <Star className="size-5 text-chart-3 fill-chart-3" />
                  <Star className="size-5 text-muted-foreground" />
                </div>
                <span className="font-semibold text-card-foreground">{rating}</span>
                <span className="text-muted-foreground">
                  ({reviews.total} {t("library:reviews")})
                </span>
              </div>
            )}
          </div>

          <Tabs defaultValue="info">
            <div className="flex items-center justify-between gap-3 mb-2">
              <TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
                <TabsTrigger value="info">{t("library:info")}</TabsTrigger>
                <TabsTrigger value="relations">{t("library:relations")}</TabsTrigger>
                {!episodesData.isLoading && !episodesData.isError && (
                  <TabsTrigger value="episodes">{t("library:episode_other")}</TabsTrigger>
                )}
                <TabsTrigger value="cast">{t("library:cast")}</TabsTrigger>
                <TabsTrigger value="characters">{t("library:characters")}</TabsTrigger>
                {!reviewsData.isLoading && !reviewsData.isError && reviews.total >= 1 && (
                  <TabsTrigger value="reviews" className="capitalize">
                    {t("library:reviews")} ({reviews.total})
                  </TabsTrigger>
                )}
                <TabsTrigger value="lists">{t("library:lists")} (30)</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="info" className="space-y-5">
              <div>
                <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:genres")}</h3>
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre: string, index: number) => {
                    const colors = [
                      "bg-chart-1/20 text-chart-1 border-chart-1/30 from-chart-1/20 to-chart-1/30",
                      "bg-chart-2/20 text-chart-2 border-chart-2/30 from-chart-2/20 to-chart-2/30",
                      "bg-chart-3/20 text-chart-3 border-chart-3/30 from-chart-3/20 to-chart-3/30",
                      "bg-chart-4/20 text-chart-4 border-chart-4/30 from-chart-4/20 to-chart-4/30",
                      "bg-chart-5/20 text-chart-5 border-chart-5/30 from-chart-5/20 to-chart-5/30",
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <Link
                        key={genre}
                        to="/"
                        search={{ landing: "true" }}
                        className={`px-3 py-1.5 bg-linear-to-r ${color} border rounded-full text-sm font-medium`}
                      >
                        {getGenreLabel(t, genre)}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:synopsis")}</h3>
                <p className="text-muted-foreground leading-relaxed">{anime.synopsis}</p>
              </div>

              <div>
                <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:animeCharacteristics")}</h3>
                <Grid minColSize={"200px"} className="gap-4">
                  {anime.type && (
                    <DetailsCard
                      title={t("library:type")}
                      icon={<FilePenLine className="size-5 text-muted-foreground" />}
                      description={anime.type}
                    />
                  )}
                  {anime.source && (
                    <DetailsCard
                      title={t("library:source")}
                      icon={<Hash className="size-5 text-muted-foreground" />}
                      description={anime.source}
                    />
                  )}
                  {anime.numberOfEpisodes && (
                    <DetailsCard
                      title={t("library:totalEpisodes")}
                      icon={<TvIcon className="size-5 text-muted-foreground" />}
                      description={anime.numberOfEpisodes}
                    />
                  )}
                  {anime.broadcast.string && (
                    <DetailsCard
                      title={t("library:broadcast")}
                      icon={<Antenna className="size-5 text-muted-foreground" />}
                      description={anime.broadcast.string}
                    />
                  )}
                  {anime.rating && (
                    <DetailsCard
                      title={t("library:rating")}
                      icon={<Building className="size-5 text-muted-foreground" />}
                      description={anime.rating}
                    />
                  )}
                  {anime.duration && (
                    <DetailsCard
                      title={t("library:runtime")}
                      icon={<Clock className="size-5 text-muted-foreground" />}
                      description={anime.duration}
                    />
                  )}
                  {anime.studios.length >= 1 && (
                    <DetailsCard
                      title={t("library:studios")}
                      icon={<Building2 className="size-5 text-muted-foreground" />}
                      description={anime.studios.map((st: { name: string; malId: number }, index: number) => (
                        <Link to="/" key={st.malId} search={{ landing: "true" }}>
                          {st.name}
                          {index < anime.studios.length - 1 && ", "}
                        </Link>
                      ))}
                    />
                  )}
                  {anime.producers.length >= 1 && (
                    <DetailsCard
                      title={t("library:producers")}
                      icon={<Languages className="size-5 text-muted-foreground" />}
                      description={anime.producers.map((pd: { name: string; malId: number }, index: number) => (
                        <Link to="/" key={pd.malId} search={{ landing: "true" }}>
                          {pd.name}
                          {index < anime.producers.length - 1 && ", "}
                        </Link>
                      ))}
                    />
                  )}
                </Grid>
              </div>

              {isAuthenticated && <AnimeEpisodeProgress season={mySeason} onToggle={handleToggle} />}

              <div>
                <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:communityStatistics")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.planning")}</span>
                      <Bookmark className="size-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">5%</p>
                  </div>

                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.watching")}</span>
                      <TvMinimalPlay className="size-5 text-chart-1" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">15%</p>
                  </div>

                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.completed")}</span>
                      <CheckCircle className="size-5 text-secondary" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">72%</p>
                  </div>

                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.dropped")}</span>
                      <XCircle className="size-5 text-destructive" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">8%</p>
                  </div>
                </div>
              </div>

              {anime.trailer.embedUrl && (
                <iframe
                  src={anime.trailer.embedUrl.replace("&autoplay=1", "")}
                  allowFullScreen
                  className="w-full aspect-video"
                  title="Trailer"
                />
              )}
            </TabsContent>
            {!episodesData.isLoading && !episodesData.isError && (
              <TabsContent value="episodes">
                <Grid minColSize={"200px"} className="gap-4">
                  {episodes
                    .sort((a: { malId: number }, b: { malId: number }) => a.malId - b.malId)
                    .map((episode: { malId: number; title: string; imageUrl: string }) => {
                      return (
                        <EpisodeItem
                          key={episode.malId}
                          title={episode.title}
                          number={episode.malId}
                          imageURL={episode.imageUrl.replace(
                            "https://myanimelist.net/images/icon-banned-youtube.png",
                            "/placeholder/banner-1.webp",
                          )}
                        />
                      );
                    })}
                </Grid>
              </TabsContent>
            )}
            <TabsContent value="relations">
              <Relations nodes={[]} edges={[]} />
            </TabsContent>
            {!reviewsData.isLoading && !reviewsData.isError && reviews.total >= 1 && (
              <TabsContent value="reviews">
                <ReviewItem
                  user={{
                    name: "John Doe",
                    avatarURL: "https://assets.hardcover.app/editions/30399846/4434002844651.jpg",
                    slug: "john-doe",
                  }}
                  reviewText={
                    "Very foda! AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA Este livro é uma obra-prima que merece ser lida por todos os amantes de boa literatura. BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA A forma como o autor desenvolve os personagens é simplesmente magnífica, cada um com sua própria voz e personalidade única."
                  }
                  criteries={{
                    language: 5,
                    characters: 4,
                    all: 10,
                    story: 8,
                    theme: 9,
                  }}
                  date={new Date("2023-06-19")}
                />
              </TabsContent>
            )}
            <TabsContent value="lists">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ListItem />
              </div>
            </TabsContent>
            <TabsContent value="cast">
              <Grid minColSize={"150px"} className="gap-4">
                {anime.cast?.map((cast: { role: string; name: string; imageUrl: string; positions: string[] }) => {
                  return (
                    <CastItem
                      key={cast.role}
                      name={cast.name}
                      character={cast.positions.map((positions) => positions).join(", ") as string}
                      imageUrl={cast.imageUrl.replace(
                        "https://cdn.myanimelist.net/images/questionmark_23.gif?s=f7dcbc4a4603d18356d3dfef8abd655c",
                        "",
                      )}
                    />
                  );
                })}
              </Grid>
            </TabsContent>
            <TabsContent value="characters">
              <Grid minColSize={"150px"} className="gap-4">
                {anime.characters?.map((character: { name: string; imageUrl: string }) => {
                  return (
                    <CharacterItem
                      key={character.name}
                      name={character.name}
                      imageUrl={character.imageUrl.replace(
                        "https://cdn.myanimelist.net/images/questionmark_23.gif?s=f7dcbc4a4603d18356d3dfef8abd655c",
                        "",
                      )}
                    />
                  );
                })}
              </Grid>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

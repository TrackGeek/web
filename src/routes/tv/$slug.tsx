import {
  SiFacebook,
  SiFacebookHex,
  SiImdb,
  SiImdbHex,
  SiInstagram,
  SiInstagramHex,
  SiX,
} from "@icons-pack/react-simple-icons";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bookmark,
  Building,
  CheckCircle,
  CheckSquare,
  Clock,
  ExternalLink,
  FilePenLine,
  FileType,
  Hash,
  Heart,
  Languages,
  MoreHorizontal,
  Star,
  TvIcon,
  TvMinimalPlay,
  XCircle,
} from "lucide-react";
import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@/components/layouts/grid.tsx";
import { CastItem } from "@/components/pages/details/cast";
import { EpisodeItem } from "@/components/pages/details/episode";
import { ListItem } from "@/components/pages/details/list";
import { EpisodeProgress, type SeasonData } from "@/components/pages/details/progress";
import { ReviewItem } from "@/components/pages/details/review";
import { DetailsCard } from "@/components/shared/cards/details";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { EpisodicContentModal } from "@/components/shared/modals/episodic-content";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { cn } from "@/lib/utils";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";
import { seo } from "@/lib/utils/seo";
import { getStatusLabel } from "@/lib/utils/status.ts";

export const Route = createFileRoute("/tv/$slug")({
  head: () => ({
    meta: [...seo({ title: "TV Show Details" })],
  }),
  component: TVShowDetailsPage,
});

export function TVShowDetailsPage() {
  const { slug } = Route.useParams();

  const { t } = useTranslation();
  const [mySeasons, _setMySeasons] = useState<SeasonData[]>([
    {
      seasonNumber: 0,
      totalEpisodes: 3,
      watchedEpisodes: [1, 2],
    },
    {
      seasonNumber: 1,
      totalEpisodes: 10,
      watchedEpisodes: [1, 2, 3, 4, 5],
    },
    {
      seasonNumber: 2,
      totalEpisodes: 8,
      watchedEpisodes: [],
    },
  ]);

  function handleToggle(season: number, ep: number) {
    console.log(season, ep);
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tv", slug],
    queryFn: () => api.get(`/tv/detail/${slug}`).then(({ data }) => data.tvShow),
  });
  const item = data;

  const seasonsData = useQuery({
    queryKey: ["tvSeason", slug],
    queryFn: () => api.get(`/tv/detail/${slug}/season`).then(({ data }) => data.seasons),
  });
  const seasons = seasonsData?.data;

  const reviewsData = useQuery({
    queryKey: ["tvReviews", slug],
    queryFn: () => api.get(`/tv/review/?tvShowId=${slug}`).then(({ data }) => data.tvShowReviews),
  });
  const reviews = reviewsData?.data;

  const rating = 4.2;
  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  if (isLoading || seasonsData.isLoading || reviewsData.isLoading) return <LoadingDetails />;
  if (isError || seasonsData.isError || reviewsData.isError || !item) return <ErrorComponent />;
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3">
        <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 gap-4 flex flex-col">
          <div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
            <img
              src={item.posterUrl || "/placeholder/cover.webp"}
              alt={`${item.name} Cover`}
              className="w-full h-auto object-cover"
            />
          </div>

          {isAuthenticated && (
            <>
              <div className="grid grid-cols-3 w-full gap-4">
                <Button className="size-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-purple-400 transition-all duration-300 bg-card hover:bg-purple-400/20">
                  <div className="flex flex-col items-center gap-x-4 gap-2">
                    <div className="size-10 rounded-full bg-linear-to-r from-purple-500/20 to-violet-500/20 flex items-center justify-center border border-purple-500/30">
                      <Bookmark className="text-purple-400 size-6" />
                    </div>
                    <p className="font-medium text-card-foreground text-center text-base">{t("feed:lists.planning")}</p>
                  </div>
                  <div className="status-indicator hidden">
                    <CheckCircle className="text-secondary size-6" />
                  </div>
                </Button>

                <Button className="size-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 bg-card hover:bg-primary/20">
                  <div className="flex flex-col items-center gap-x-4 gap-2">
                    <div className="size-10 rounded-full bg-linear-to-r from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                      <TvMinimalPlay className="text-primary size-6" />
                    </div>
                    <p className="font-medium text-card-foreground text-center text-base">{t("feed:lists.watching")}</p>
                  </div>
                  <div className="status-indicator hidden">
                    <CheckCircle className="text-secondary size-6" />
                  </div>
                </Button>

                <Button className="size-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-chart-3 transition-all duration-300 bg-card hover:bg-chart-3/20">
                  <div className="flex flex-col items-center gap-x-4 gap-2">
                    <div className="size-10 rounded-full bg-linear-to-r from-chart-3/20 to-amber-500/20 flex items-center justify-center border border-chart-3/30">
                      <CheckSquare className="text-chart-3 size-6" />
                    </div>
                    <p className="font-medium text-card-foreground text-center text-base">
                      {t("feed:lists.completed")}
                    </p>
                  </div>
                  <div className="status-indicator hidden">
                    <CheckCircle className="text-secondary size-6" />
                  </div>
                </Button>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex bg-transparent items-center justify-center space-x-2 w-full py-3 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-all duration-300">
                    <MoreHorizontal className="w-5 h-5" />
                    <span className="text-sm font-medium">{t("library:moreOptions")}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden p-0">
                  <DialogHeader
                    className="h-48 p-0 flex flex-row items-center bg-cover bg-center px-6 relative"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url("${item.posterUrl}")`,
                    }}
                  >
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
                    <div className="flex flex-row items-center w-full">
                      <img
                        src={item.posterUrl}
                        alt="Cover"
                        className="w-28 h-40 object-cover rounded-lg shadow-2xl relative z-10 border-2 border-white/30"
                      />
                      <div className="flex-1 px-6 relative z-10">
                        <DialogTitle className="text-white font-bold text-2xl drop-shadow-lg mb-2">
                          {item.name}
                        </DialogTitle>
                        <div className="flex items-center gap-4 text-white/90 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="size-4 fill-yellow-400 text-yellow-400" />
                            <span>{rating}</span>
                          </div>
                          <span>•</span>
                          <span>
                            {new Date(item.firstAirDate).getFullYear()} - {new Date(item.lastAirDate).getFullYear()}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm mt-2 max-w-md line-clamp-2">{item.tagline}</p>
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

          <div className="border-t border-border"></div>

          <Grid minColSize={"128px"} className="gap-4">
            {item.status && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">{t("library:status")}</p>
                <p className="font-semibold text-card-foreground">{getStatusLabel(t, item.status)}</p>
              </div>
            )}
            {item.firstAirDate && item.lastAirDate && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">{t("library:releaseDate")}</p>
                <p className="font-semibold text-card-foreground">
                  {new Date(item.firstAirDate).getFullYear()} - {new Date(item.lastAirDate).getFullYear()}
                </p>
              </div>
            )}
          </Grid>
          <RefreshData sourceURL={`https://www.themoviedb.org/tv/${item.tmdbId}`} />
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {item.homepage && (
              <a href={item.homepage} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
              </a>
            )}
            {(() => {
              const ext = item?.external || ({} as Record<string, any>);
              const links: { href: string; key: string; className?: string; icon: ReactElement }[] = [];

              if (ext.instagram_id) {
                links.push({
                  href: `https://instagram.com/${ext.instagram_id}`,
                  key: "instagram",
                  className: cn(`hover:text-[${SiInstagramHex}]`),
                  icon: <SiInstagram />,
                });
              }

              if (ext.facebook_id) {
                links.push({
                  href: `https://www.facebook.com/${ext.facebook_id}`,
                  key: "facebook",
                  className: cn(`hover:text-[${SiFacebookHex}]`),
                  icon: <SiFacebook />,
                });
              }

              if (ext.twitter_id) {
                links.push({
                  href: `https://x.com/${ext.twitter_id}`,
                  key: "x",
                  className: cn("hover:text-white"),
                  icon: <SiX />,
                });
              }

              if (ext.imdb_id) {
                links.push({
                  href: `https://www.imdb.com/title/${ext.imdb_id}`,
                  key: "imdb",
                  className: cn(`hover:text-[${SiImdbHex}]`, "my-0.5"),
                  icon: <SiImdb />,
                });
              }

              return links.map((l) => (
                <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" className={l.className}>
                  {l.icon}
                </a>
              ));
            })()}
          </div>
        </div>
      </div>

      <div className="lg:w-2/3">
        <div className="bg-card rounded-2xl shadow-lg p-8 space-y-3">
          <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
            {item.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 border-b border-border">
            {reviews.total >= 1 && (
              <div className="flex items-center mb-3 space-x-1">
                <div className="flex mr-1">
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
                <TabsTrigger value="episodes">{t("library:episode_other")}</TabsTrigger>
                <TabsTrigger value="cast">{t("library:cast")}</TabsTrigger>
                {item.backdrops.length >= 1 && <TabsTrigger value="medias">{t("library:medias")}</TabsTrigger>}
                {reviews.total >= 1 && (
                  <TabsTrigger value="reviews" className="capitalize">
                    {t("library:reviews")} ({reviews.total})
                  </TabsTrigger>
                )}
                <TabsTrigger value="lists">{t("library:lists")} (30)</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="info" className={"space-y-5"}>
              <div>
                <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:genres")}</h3>
                <div className="flex flex-wrap gap-2">
                  {item.genres.map((genre: string, index: number) => {
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
                <div className="text-muted-foreground leading-relaxed space-y-4">
                  <p>{item.tagline}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-card-foreground text-lg mb-4">
                  {t("library:tvShowCharacteristics")}
                </h3>
                <Grid minColSize={"200px"} className="gap-4">
                  {item?.createdBy.length >= 1 && (
                    <DetailsCard
                      title={t("library:creators")}
                      icon={<FilePenLine className="size-5 text-muted-foreground" />}
                      description={item.createdBy
                        .map((cb: { name: string }) => {
                          return cb.name;
                        })
                        .join(", ")}
                    />
                  )}
                  {item.numberOfSeasons && (
                    <DetailsCard
                      title={t("library:season_other")}
                      icon={<Hash className="size-5 text-muted-foreground" />}
                      description={item.numberOfSeasons}
                    />
                  )}
                  {item.numberOfEpisodes && (
                    <DetailsCard
                      title={t("library:totalEpisodes")}
                      icon={<TvIcon className="size-5 text-muted-foreground" />}
                      description={item.numberOfEpisodes}
                    />
                  )}
                  {item.originalLanguage && (
                    <DetailsCard
                      title={t("library:language")}
                      icon={<Languages className="size-5 text-muted-foreground" />}
                      description={item.originalLanguage}
                    />
                  )}
                  {item?.productionCompanies?.length >= 1 && (
                    <DetailsCard
                      title={t("library:productionCompanies")}
                      icon={<Building className="size-5 text-muted-foreground" />}
                      description={item.productionCompanies
                        .map((pc: { name: string }) => {
                          return pc.name;
                        })
                        .join(", ")}
                    />
                  )}
                  {item?.episodeRuntime?.length >= 1 && (
                    <DetailsCard
                      title={t("library:runtime")}
                      icon={<Clock className="size-5 text-muted-foreground" />}
                      description={`${item?.episodeRuntime[0]} minutes`}
                    />
                  )}
                  {item.type && (
                    <DetailsCard
                      title={t("library:type")}
                      icon={<FileType className="size-5 text-muted-foreground" />}
                      description={item.type}
                    />
                  )}
                </Grid>
              </div>

              {isAuthenticated && (
                <EpisodeProgress
                  seasons={mySeasons}
                  defaultSeason={1}
                  seasonCustomNames={{
                    0: t("library:specials"),
                  }}
                  onToggle={handleToggle}
                />
              )}

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

              {item.trailerId && (
                <iframe
                  src={`https://youtube.com/embed/${item.trailerId}`}
                  allowFullScreen
                  className="w-full aspect-video"
                  title="Trailer"
                />
              )}
            </TabsContent>
            <TabsContent value="episodes">
              <Accordion type="single" collapsible defaultValue="item-1">
                {seasons.map((season: any) => (
                  <AccordionItem key={season.id} value={`item-${season.seasonNumber}`}>
                    <AccordionTrigger className="cursor-pointer">
                      <h3 className="font-semibold text-card-foreground text-lg mb-3">{season.name}</h3>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {season.episodes.map((episode: { episodeNumber: number; name: string; stillUrl: string }) => (
                          <EpisodeItem
                            key={episode.episodeNumber}
                            title={episode.name}
                            number={episode.episodeNumber}
                            imageURL={episode.stillUrl}
                          />
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
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
            <TabsContent value="lists">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ListItem />
              </div>
            </TabsContent>
            <TabsContent value="cast">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {item.cast?.map((cast: { character: string; name: string; profileUrl: string }) => {
                  return (
                    <CastItem
                      key={cast.character}
                      name={cast.name}
                      character={cast.character}
                      imageUrl={cast.profileUrl}
                    />
                  );
                })}
              </div>
            </TabsContent>
            {item.backdrops.length >= 1 && (
              <TabsContent value="medias">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {item.backdrops?.map((url: string, i: number) => (
                    <ImageZoom key={i}>
                      <img src={url} alt="Backdrop" />
                    </ImageZoom>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

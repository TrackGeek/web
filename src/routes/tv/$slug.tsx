import { Icon } from "@iconify/react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Grid } from "@/components/layouts/grid.tsx";
import { CastItem } from "@/components/pages/details/cast";
import { CommunityStats } from "@/components/pages/details/community-stats";
import { DetailsPageLayout } from "@/components/pages/details/details-page-layout";
import { EpisodeItem } from "@/components/pages/details/episode";
import { GenrePills } from "@/components/pages/details/genre-pills";
import { ListItem } from "@/components/pages/details/list";
import { MoreOptionsDialog } from "@/components/pages/details/more-options-dialog";
import { EpisodeProgress, type SeasonData } from "@/components/pages/details/progress";
import { QuickStatusButtons } from "@/components/pages/details/quick-status-buttons";
import { ReviewItem } from "@/components/pages/details/review";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { DetailsCard } from "@/components/shared/cards/details";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { EpisodicContentModal } from "@/components/shared/modals/episodic-content";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { cn } from "@/lib/utils";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";
import { seo } from "@/lib/utils/seo";
import { getStatusLabel } from "@/lib/utils/status.ts";

export const Route = createFileRoute("/tv/$slug")({
  loader: async ({ params }) => {
    const item = await api.get(apiEndpoints.getTvShowDetails(params.slug)).then(({ data }) => data.tvShow);
    return { item };
  },
  head: ({ loaderData }) => {
    const item = loaderData?.item;
    return {
      meta: [
        ...seo({
          title: item?.name ? item.name : "TV Show Details",
          description: item?.tagline ?? item?.tagline ?? undefined,
          image: item?.posterUrl ?? undefined,
        }),
      ],
    };
  },
  component: TVShowDetailsPage,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function TVShowDetailsPage() {
  const { slug } = Route.useParams();
  const { item: loaderItem } = Route.useLoaderData();

  const { t } = useTranslation();
  const [mySeasons, _setMySeasons] = useState<SeasonData[]>([
    { seasonNumber: 0, totalEpisodes: 3, watchedEpisodes: [1, 2] },
    { seasonNumber: 1, totalEpisodes: 10, watchedEpisodes: [1, 2, 3, 4, 5] },
    { seasonNumber: 2, totalEpisodes: 8, watchedEpisodes: [] },
  ]);

  function handleToggle(season: number, ep: number) {
    console.log(season, ep);
  }

  const tvQuery = useQuery({
    queryKey: ["tv", slug],
    queryFn: () => api.get(apiEndpoints.getTvShowDetails(slug)).then(({ data }) => data.tvShow),
    initialData: loaderItem,
  });

  const item = tvQuery.data;

  const [seasonsQuery, reviewsQuery] = useQueries({
    queries: [
      {
        queryKey: ["tvSeason", slug],
        queryFn: () => api.get(apiEndpoints.getTvShowSeasonDetails(slug)).then(({ data }) => data.seasons),
      },
      {
        queryKey: ["tvReviews", item?.id],
        queryFn: () =>
          api.get(`${apiEndpoints.tvShowReview}/?tvShowId=${item?.id}`).then(({ data }) => data.tvShowReviews),
        enabled: !!item?.id,
      },
    ],
  });

  const seasons = seasonsQuery.data;
  const reviews = reviewsQuery.data;

  const rating = 4.2;
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return api.post(apiEndpoints.refreshTvShowData, { tmdbId: Number(slug) });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["tv", slug] });
    },
    onError: () => {
      return toast.error(t("api:TV_SHOW_ALREADY_REFRESHED"));
    },
  });
  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  if (tvQuery.isLoading || seasonsQuery.isLoading || reviewsQuery.isLoading) return <LoadingDetails />;
  if (tvQuery.isError || seasonsQuery.isError || reviewsQuery.isError || !item) return <ErrorComponent />;

  const coverUrl = item.posterUrl || "/placeholder/cover.webp";
  const years = `${new Date(item.firstAirDate).getFullYear()} - ${new Date(item.lastAirDate).getFullYear()}`;

  const sidebar = (
    <>
      <div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
        <img src={coverUrl} alt={`${item.name} Cover`} className="w-full h-auto object-cover" />
      </div>

      {isAuthenticated && (
        <>
          <QuickStatusButtons
            buttons={[
              {
                label: t("feed:lists.planning"),
                icon: "lucide:bookmark",
                hoverBorder: "hover:border-purple-400",
                hoverBg: "hover:bg-purple-400/20",
                iconBg: "bg-linear-to-r from-purple-500/20 to-violet-500/20",
                iconBorder: "border-purple-500/30",
                iconColor: "text-purple-400",
              },
              {
                label: t("feed:lists.watching"),
                icon: "lucide:tv-minimal-play",
                hoverBorder: "hover:border-primary",
                hoverBg: "hover:bg-primary/20",
                iconBg: "bg-linear-to-r from-primary/20 to-secondary/20",
                iconBorder: "border-primary/30",
                iconColor: "text-primary",
              },
              {
                label: t("feed:lists.completed"),
                icon: "lucide:check-square",
                hoverBorder: "hover:border-chart-3",
                hoverBg: "hover:bg-chart-3/20",
                iconBg: "bg-linear-to-r from-chart-3/20 to-amber-500/20",
                iconBorder: "border-chart-3/30",
                iconColor: "text-chart-3",
              },
            ]}
          />
          <MoreOptionsDialog
            title={item.name}
            coverUrl={coverUrl}
            rating={rating}
            subtitle={years}
            description={item.tagline}
            triggerLabel={t("library:moreOptions")}
          >
            <EpisodicContentModal />
          </MoreOptionsDialog>
        </>
      )}

      <div className="border-t border-border" />

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
            <p className="font-semibold text-card-foreground">{years}</p>
          </div>
        )}
      </Grid>
      <RefreshData sourceURL={`https://www.themoviedb.org/tv/${item.tmdbId}`} onSubmit={() => mutation.mutate()} />
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {item.homepage && (
          <a href={item.homepage} target="_blank" rel="noopener noreferrer">
            <Icon icon={"lucide:external-link"} />
          </a>
        )}
        {(() => {
          const ext = item?.external || ({} as Record<string, any>);
          const links: { href: string; key: string; className?: string; icon: ReactElement }[] = [];

          if (ext.instagram_id) {
            links.push({
              href: `https://instagram.com/${ext.instagram_id}`,
              key: "instagram",
              className: cn(`hover:text-[#FF0069]`),
              icon: <Icon icon={"simple-icons:instagram"} />,
            });
          }
          if (ext.facebook_id) {
            links.push({
              href: `https://www.facebook.com/${ext.facebook_id}`,
              key: "facebook",
              className: cn(`hover:text-[#0866FF]`),
              icon: <Icon icon={"simple-icons:facebook"} />,
            });
          }
          if (ext.twitter_id) {
            links.push({
              href: `https://x.com/${ext.twitter_id}`,
              key: "x",
              className: cn("hover:text-white"),
              icon: <Icon icon={"simple-icons:x"} />,
            });
          }
          if (ext.imdb_id) {
            links.push({
              href: `https://www.imdb.com/title/${ext.imdb_id}`,
              key: "imdb",
              className: cn(`hover:text-[#F5C518]`, "my-0.5"),
              icon: <Icon icon={"simple-icons:imdb"} />,
            });
          }

          return links.map((l) => (
            <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" className={l.className}>
              {l.icon}
            </a>
          ));
        })()}
      </div>
    </>
  );

  return (
    <DetailsPageLayout sidebar={sidebar}>
      <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
        {item.name}
      </h1>

      <div className="flex flex-wrap items-center gap-6 border-b border-border">
        {reviews.total >= 1 && (
          <div className="flex items-center mb-3 space-x-1">
            <div className="flex mr-1">
              <Icon icon={"lucide:star"} className="size-5 text-chart-3 fill-chart-3" />
              <Icon icon={"lucide:star"} className="size-5 text-chart-3 fill-chart-3" />
              <Icon icon={"lucide:star"} className="size-5 text-chart-3 fill-chart-3" />
              <Icon icon={"lucide:star"} className="size-5 text-chart-3 fill-chart-3" />
              <Icon icon={"lucide:star"} className="size-5 text-muted-foreground" />
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
            <GenrePills genres={item.genres} getLabel={(g) => getGenreLabel(t, g)} />
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:synopsis")}</h3>
            <div className="text-muted-foreground leading-relaxed space-y-4">
              <p>{item.tagline}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:tvShowCharacteristics")}</h3>
            <Grid minColSize={"200px"} className="gap-4">
              {item?.createdBy.length >= 1 && (
                <DetailsCard
                  title={t("library:creators")}
                  icon={<Icon icon={"lucide:file-pen-line"} className="size-5 text-muted-foreground" />}
                  description={item.createdBy.map((cb: { name: string }) => cb.name).join(", ")}
                />
              )}
              {item.numberOfSeasons && (
                <DetailsCard
                  title={t("library:season_other")}
                  icon={<Icon icon={"lucide:hash"} className="size-5 text-muted-foreground" />}
                  description={item.numberOfSeasons}
                />
              )}
              {item.numberOfEpisodes && (
                <DetailsCard
                  title={t("library:totalEpisodes")}
                  icon={<Icon icon={"lucide:tv"} className="size-5 text-muted-foreground" />}
                  description={item.numberOfEpisodes}
                />
              )}
              {item.originalLanguage && (
                <DetailsCard
                  title={t("library:language")}
                  icon={<Icon icon={"lucide:languages"} className="size-5 text-muted-foreground" />}
                  description={item.originalLanguage}
                />
              )}
              {item?.productionCompanies?.length >= 1 && (
                <DetailsCard
                  title={t("library:productionCompanies")}
                  icon={<Icon icon={"lucide:building"} className="size-5 text-muted-foreground" />}
                  description={item.productionCompanies.map((pc: { name: string }) => pc.name).join(", ")}
                />
              )}
              {item?.episodeRuntime?.length >= 1 && (
                <DetailsCard
                  title={t("library:runtime")}
                  icon={<Icon icon={"lucide:clock"} className="size-5 text-muted-foreground" />}
                  description={`${item?.episodeRuntime[0]} minutes`}
                />
              )}
              {item.type && (
                <DetailsCard
                  title={t("library:type")}
                  icon={<Icon icon={"lucide:file-type"} className="size-5 text-muted-foreground" />}
                  description={item.type}
                />
              )}
            </Grid>
          </div>

          {isAuthenticated && (
            <EpisodeProgress
              seasons={mySeasons}
              defaultSeason={1}
              seasonCustomNames={{ 0: t("library:specials") }}
              onToggle={handleToggle}
            />
          )}

          <div>
            <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:communityStatistics")}</h3>
            <CommunityStats
              stats={[
                { label: t("feed:lists.planning"), icon: "lucide:bookmark", iconClass: "text-purple-400", value: "5%" },
                {
                  label: t("feed:lists.watching"),
                  icon: "lucide:tv-minimal-play",
                  iconClass: "text-chart-1",
                  value: "15%",
                },
                {
                  label: t("feed:lists.completed"),
                  icon: "lucide:check-circle",
                  iconClass: "text-secondary",
                  value: "72%",
                },
                { label: t("feed:lists.dropped"), icon: "lucide:x-circle", iconClass: "text-destructive", value: "8%" },
              ]}
            />
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
            {item.cast?.map((cast: { character: string; name: string; profileUrl: string }) => (
              <CastItem key={cast.character} name={cast.name} character={cast.character} imageUrl={cast.profileUrl} />
            ))}
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
    </DetailsPageLayout>
  );
}

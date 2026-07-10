import { Icon } from "@iconify/react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Grid } from "@/components/layouts/grid.tsx";
import { CastItem } from "@/components/pages/details/cast";
import { EpisodeItem } from "@/components/pages/details/episode";
import { ListItem } from "@/components/pages/details/list";
import { EpisodeProgress, type SeasonData } from "@/components/pages/details/progress";
import { ReviewItem } from "@/components/pages/details/review-item";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { DetailsCard } from "@/components/shared/cards/details";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { EpisodicContentModal } from "@/components/shared/modals/episodic-content";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { StarRating } from "@/components/shared/star-rating.tsx";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToggleReviewReaction } from "@/hooks/review";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { cn } from "@/lib/utils";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";
import { seo } from "@/lib/utils/seo";
import { getStatusLabel } from "@/lib/utils/status.ts";
import { Card, CardContent } from '@/components/ui/card';

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
  const [openSeason, setOpenSeason] = useState<string | undefined>("item-1");
  const [moreOpen, setMoreOpen] = useState(false);

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

  const listsQuery = useQuery<ApiTypes.PaginatedResponse<ApiTypes.ListWithPreview>>({
    queryKey: ["tvContainingLists", item?.id],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsContainingItemResponse>(apiEndpoints.getListsContainingItem, {
          params: { type: "TVShow", tvShowId: item?.id, itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists),
    enabled: !!item?.id,
  });

  const rating = item.tgReviewScore;
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
  const userId = session?.data?.user?.id;

  const toggleReaction = useToggleReviewReaction("tv", userId ?? "");

  const episodeWatchQuery = useQuery<EpisodeWatch[]>({
    queryKey: ["tvEpisodeWatch", item?.id, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.getTvShowEpisodeWatch(userId as string, item?.id as string))
        .then(({ data }) => data.tvShowEpisodeWatch),
    enabled: isAuthenticated && !!userId && !!item?.id,
  });

  const mySeasons: SeasonData[] = (seasons ?? [])
    .filter((season: SeasonDetails) => season.numberOfEpisodes > 0)
    .map((season: SeasonDetails) => ({
      seasonNumber: season.seasonNumber,
      totalEpisodes: season.numberOfEpisodes,
      watchedEpisodes: (episodeWatchQuery.data ?? [])
        .filter((watch) => watch.season === season.seasonNumber && watch.status === "Completed")
        .map((watch) => watch.episode),
    }));

  const totalWatchedEpisodes = mySeasons.reduce((acc, season) => acc + season.watchedEpisodes.length, 0);

  const favoriteQuery = useQuery<boolean>({
    queryKey: ["tvFavorite", item?.id, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetFavoriteStatusResponse>(apiEndpoints.getFavoriteStatus, {
          params: { type: "TVShow", tvShowId: item?.id },
        })
        .then(({ data }) => data.favorited),
    enabled: isAuthenticated && !!userId && !!item?.id,
  });

  const isFavorited = !!favoriteQuery.data;

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => {
      const body = { type: "TVShow", tvShowId: item?.id };

      return isFavorited
        ? api.delete(apiEndpoints.removeFavorite, { data: body })
        : api.post(apiEndpoints.addFavorite, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tvFavorite", item?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["tvFavorite", item?.id, userId] });
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  const toggleEpisodeMutation = useMutation({
    mutationFn: ({ season, episode, watched }: { season: number; episode: number; watched: boolean }) => {
      if (watched) {
        return api.delete(apiEndpoints.tvShowEpisodeWatch, {
          data: { tvShowId: item?.id, season, episode },
        });
      }

      return api.post(apiEndpoints.tvShowEpisodeWatch, {
        tvShowId: item?.id,
        episodes: [{ season, episode, status: "Completed" }],
      });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["tvEpisodeWatch", item?.id, userId] });
    },
    onError: () => {
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  function handleWatchEpisodeToggle(season: number, episode: number) {
    const watched = mySeasons.find((s) => s.seasonNumber === season)?.watchedEpisodes.includes(episode);

    toggleEpisodeMutation.mutate({ season, episode, watched: !!watched });
  }

  const toggleSeasonMutation = useMutation({
    mutationFn: async ({ seasonNumber, watched }: { seasonNumber: number; watched: boolean }) => {
      const season = mySeasons.find((s) => s.seasonNumber === seasonNumber);

      if (watched) {
        const totalEpisodes = season?.totalEpisodes ?? 0;
        const episodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1);

        await api.post(apiEndpoints.tvShowEpisodeWatch, {
          tvShowId: item?.id,
          episodes: episodes.map((episode) => ({ season: seasonNumber, episode, status: "Completed" })),
        });

        return;
      }

      await Promise.all(
        (season?.watchedEpisodes ?? []).map((episode) =>
          api.delete(apiEndpoints.tvShowEpisodeWatch, {
            data: { tvShowId: item?.id, season: seasonNumber, episode },
          }),
        ),
      );
    },
    onSuccess: () => {
      toast.success(t("library:progressUpdated"));
      return queryClient.invalidateQueries({ queryKey: ["tvEpisodeWatch", item?.id, userId] });
    },
    onError: () => {
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  const toggleAllMutation = useMutation({
    mutationFn: (watched: boolean) => {
      if (watched) {
        return api.post(apiEndpoints.tvShowEpisodeWatchAll, { tvShowId: item?.id });
      }

      return api.delete(apiEndpoints.tvShowEpisodeWatchAll, {
        data: { tvShowId: item?.id },
      });
    },
    onSuccess: () => {
      toast.success(t("library:progressUpdated"));
      return queryClient.invalidateQueries({ queryKey: ["tvEpisodeWatch", item?.id, userId] });
    },
    onError: () => {
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  function handleWatchSeasonToggle(seasonNumber: number, watched: boolean) {
    toggleSeasonMutation.mutate({ seasonNumber, watched });
  }

  function handleWatchAllToggle(watched: boolean) {
    toggleAllMutation.mutate(watched);
  }

  const progressQuery = useQuery<TvShowProgress | null>({
    queryKey: ["tvProgress", item?.id, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.getTvShowProgress(userId as string, item?.id as string))
        .then(({ data }) => data.tvShowProgresses.items[0] ?? null),
    enabled: isAuthenticated && !!userId && !!item?.id,
  });

  const currentStatus = progressQuery.data?.status;

  const setProgressMutation = useMutation({
    mutationFn: (status: ProgressStatus) => {
      const current = progressQuery.data;

      if (current && current.status === status) {
        return api.delete(`${apiEndpoints.tvShowProgress}/${current.id}`);
      }

      return api.post(apiEndpoints.tvShowProgress, { tvShowId: item?.id, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tvProgress", item?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["tvEpisodeWatch", item?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["tv", slug] });
    },
    onError: () => {
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  const progressButtons = [
    {
      status: "Planning" as const,
      label: t("feed:lists.planning"),
      icon: "lucide:bookmark",
      hoverBorder: "hover:border-purple-400",
      hoverBg: "hover:bg-purple-400/20",
      activeClass: "border-purple-400 bg-purple-400/20",
      ringGradient: "from-purple-500/20 to-violet-500/20",
      ringBorder: "border-purple-500/30",
      iconColor: "text-purple-400",
    },
    {
      status: "Watching" as const,
      label: t("feed:lists.watching"),
      icon: "lucide:tv-minimal-play",
      hoverBorder: "hover:border-primary",
      hoverBg: "hover:bg-primary/20",
      activeClass: "border-primary bg-primary/20",
      ringGradient: "from-primary/20 to-secondary/20",
      ringBorder: "border-primary/30",
      iconColor: "text-primary",
    },
    {
      status: "Completed" as const,
      label: t("feed:lists.completed"),
      icon: "lucide:check-square",
      hoverBorder: "hover:border-chart-3",
      hoverBg: "hover:bg-chart-3/20",
      activeClass: "border-chart-3 bg-chart-3/20",
      ringGradient: "from-chart-3/20 to-amber-500/20",
      ringBorder: "border-chart-3/30",
      iconColor: "text-chart-3",
    },
  ];

  if (tvQuery.isLoading || seasonsQuery.isLoading || reviewsQuery.isLoading) {
    return <LoadingDetails />;
  }

  if (tvQuery.isError || seasonsQuery.isError || reviewsQuery.isError || !item) {
    return <ErrorComponent />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
              <Image
                src={item.posterUrl || "/placeholder/cover.webp"}
                width={500}
                height={750}
                alt={`${item.name} Cover`}
                className="w-full h-auto object-cover"
              />
            </div>

            {isAuthenticated && (
              <>
                <div className="grid grid-cols-3 w-full gap-4">
                  {progressButtons.map((button) => {
                    const isActive = currentStatus === button.status;

                    return (
                      <Button
                        key={button.status}
                        disabled={setProgressMutation.isPending}
                        onClick={() => setProgressMutation.mutate(button.status)}
                        className={cn(
                          "size-full flex flex-col items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 bg-card disabled:opacity-50",
                          button.hoverBorder,
                          button.hoverBg,
                          isActive ? button.activeClass : "border-border",
                        )}
                      >
                        <div className="flex flex-col items-center gap-x-4 gap-2">
                          <div
                            className={cn(
                              "size-10 rounded-full bg-linear-to-r flex items-center justify-center border",
                              button.ringGradient,
                              button.ringBorder,
                            )}
                          >
                            <Icon icon={button.icon} className={cn("size-6", button.iconColor)} />
                          </div>
                          <p className="font-medium text-card-foreground text-center text-base">{button.label}</p>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex bg-transparent items-center justify-center space-x-2 w-full py-3 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-all duration-300">
                      <Icon icon={"lucide:more-horizontal"} className="w-5 h-5" />
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
                        <Image
                          src={item.posterUrl}
                          width={112}
                          height={160}
                          alt="Cover"
                          className="w-28! h-40 shrink-0 object-cover rounded-lg shadow-2xl relative z-10 border-2 border-white/30"
                        />

                        <div className="flex-1 px-6 relative z-10">
                          <DialogTitle className="text-white font-bold text-2xl drop-shadow-lg mb-2">
                            {item.name}
                          </DialogTitle>

                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <div className="flex items-center gap-1">
                              <StarRating value={1} max={1} />

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
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={toggleFavoriteMutation.isPending || favoriteQuery.isFetching}
                          onClick={() => toggleFavoriteMutation.mutate()}
                          className="text-white hover:bg-white/10 hover:text-white"
                        >
                          <Icon icon={"lucide:heart"} className={cn("size-6", isFavorited && "text-red-500")} />
                        </Button>
                      </div>
                    </DialogHeader>

                    <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
                      <EpisodicContentModal
                        tvShowId={item.id}
                        totalEpisodes={item.numberOfEpisodes}
                        watchedEpisodes={totalWatchedEpisodes}
                        onClose={() => setMoreOpen(false)}
                      />
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

            <RefreshData
              sourceURL={`https://www.themoviedb.org/tv/${item.tmdbId}`}
              onSubmit={() => {
                mutation.mutate();
              }}
            />

            <div className="flex flex-wrap gap-3 items-center justify-center">
              {item.homepage && (
                <a href={item.homepage} target="_blank" rel="noopener noreferrer">
                  <Icon icon={"lucide:external-link"} />
                </a>
              )}

              {(
                [
                  {
                    id: item?.external?.instagram_id,
                    href: (v: string) => `https://instagram.com/${v}`,
                    key: "instagram",
                    className: "hover:text-[#FF0069]",
                    icon: "simple-icons:instagram",
                  },
                  {
                    id: item?.external?.facebook_id,
                    href: (v: string) => `https://www.facebook.com/${v}`,
                    key: "facebook",
                    className: "hover:text-[#0866FF]",
                    icon: "simple-icons:facebook",
                  },
                  {
                    id: item?.external?.twitter_id,
                    href: (v: string) => `https://x.com/${v}`,
                    key: "x",
                    className: "hover:text-white",
                    icon: "simple-icons:x",
                  },
                  {
                    id: item?.external?.imdb_id,
                    href: (v: string) => `https://www.imdb.com/title/${v}`,
                    key: "imdb",
                    className: "hover:text-[#F5C518] my-0.5",
                    icon: "simple-icons:imdb",
                  },
                ] as const
              )
                .filter((l) => !!l.id)
                .map((l) => (
                  <a
                    key={l.key}
                    href={l.href(l.id ?? "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={l.className}
                  >
                    <Icon icon={l.icon} />
                  </a>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:w-2/3">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
              {item.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 border-b border-border">
              {reviews.total >= 1 && (
                <div className="flex items-center mb-3 space-x-1">
                  <StarRating value={rating} className="mr-1" />
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

                  <TabsTrigger value="medias">{t("library:medias")}</TabsTrigger>

                  <TabsTrigger value="reviews" className="capitalize">
                    {t("library:reviews")} ({reviews.total})
                  </TabsTrigger>

                  <TabsTrigger value="lists">
                    {t("library:lists")} ({listsQuery.data?.total ?? 0})
                  </TabsTrigger>
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
                        <span
                          key={genre}
                          className={`px-3 py-1.5 bg-linear-to-r ${color} border rounded-full text-sm font-medium`}
                        >
                          {getGenreLabel(t, genre)}
                        </span>
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
                  <Grid minColSize={"200px"} className="gap-4 items-start">
                    {item?.createdBy.length >= 1 && (
                      <DetailsCard
                        title={t("library:creators")}
                        icon={<Icon icon={"lucide:file-pen-line"} className="size-5 text-muted-foreground" />}
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
                        description={item.originalLanguage.toUpperCase()}
                      />
                    )}
                    {item?.productionCompanies?.length >= 1 && (
                      <DetailsCard
                        title={t("library:productionCompanies")}
                        icon={<Icon icon={"lucide:building"} className="size-5 text-muted-foreground" />}
                        description={
                          <span className="inline-flex items-center gap-1.5">
                            <span className="truncate">{item.productionCompanies[0].name}</span>
                            {item.productionCompanies.length > 1 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="shrink-0 cursor-default rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                                    +{item.productionCompanies.length - 1}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <ul className="flex flex-col gap-0.5">
                                    {item.productionCompanies.slice(1).map((pc: { name: string }) => (
                                      <li key={pc.name}>{pc.name}</li>
                                    ))}
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                        }
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
                    seasonCustomNames={{
                      0: t("library:specials"),
                    }}
                    isLoading={
                      toggleSeasonMutation.isPending || toggleAllMutation.isPending || toggleEpisodeMutation.isPending
                    }
                    onToggleEpisode={handleWatchEpisodeToggle}
                    onToggleSeason={handleWatchSeasonToggle}
                    onToggleAll={handleWatchAllToggle}
                  />
                )}

                <div>
                  <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:communityStatistics")}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(
                      [
                        {
                          key: "planToWatch",
                          label: t("feed:lists.planning"),
                          icon: "lucide:bookmark",
                          iconClassName: "text-purple-400",
                        },
                        {
                          key: "watching",
                          label: t("feed:lists.watching"),
                          icon: "lucide:tv-minimal-play",
                          iconClassName: "text-chart-1",
                        },
                        {
                          key: "completed",
                          label: t("feed:lists.completed"),
                          icon: "lucide:check-circle",
                          iconClassName: "text-secondary",
                        },
                        {
                          key: "dropped",
                          label: t("feed:lists.dropped"),
                          icon: "lucide:x-circle",
                          iconClassName: "text-destructive",
                        },
                      ] as const
                    ).map((stat) => {
                      const value = item.progressStats?.[stat.key] ?? { count: 0, percentage: 0 };

                      return (
                        <div
                          key={stat.key}
                          className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                            <Icon icon={stat.icon} className={cn("size-5", stat.iconClassName)} />
                          </div>
                          <p className="text-2xl font-bold text-card-foreground">{value.percentage}%</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {value.count} {t("library:users")}
                          </p>
                        </div>
                      );
                    })}
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
                <Accordion type="single" collapsible value={openSeason} onValueChange={setOpenSeason}>
                  {seasons.map((season: any) => {
                    const seasonValue = `item-${season.seasonNumber}`;

                    return (
                      <AccordionItem key={season.id} value={seasonValue}>
                        <AccordionTrigger className="cursor-pointer">
                          <h3 className="font-semibold text-card-foreground text-lg mb-3">{season.name}</h3>
                        </AccordionTrigger>
                        <AccordionContent>
                          <SeasonEpisodes
                            slug={slug}
                            seasonNumber={season.seasonNumber}
                            isOpen={openSeason === seasonValue}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </TabsContent>

              <TabsContent value="reviews">
                {reviews.items.length === 0 ? (
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Icon icon="lucide:star" />
                      </EmptyMedia>
                      <EmptyTitle>{t("library:noReviews")}</EmptyTitle>
                      <EmptyDescription>{t("library:noReviewsDescription")}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <div className="flex flex-col divide-y divide-border/30">
                    {reviews.items.map((review: ApiTypes.TVShowReview) => (
                      <ReviewItem
                        key={review.id}
                        user={review.user}
                        reviewText={review.summary ?? ""}
                        notes={review.notes}
                        story={review.story}
                        date={new Date(review.createdAt)}
                        criteries={{
                          all: Number(review.overall),
                          direction: review.direction != null ? Number(review.direction) : undefined,
                          production: review.production != null ? Number(review.production) : undefined,
                          acting: review.acting != null ? Number(review.acting) : undefined,
                        }}
                        reviewId={review.id}
                        reactions={review.reactions}
                        onReact={(emoji, currentReaction) =>
                          toggleReaction.mutate(
                            { reviewId: review.id, currentReaction, emoji },
                            { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tvReviews", item.id] }) },
                          )
                        }
                        isReacting={toggleReaction.isPending && toggleReaction.variables?.reviewId === review.id}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="lists">
                {!listsQuery.data || listsQuery.data.items.length === 0 ? (
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Icon icon="lucide:list" />
                      </EmptyMedia>
                      <EmptyTitle>{t("library:noLists")}</EmptyTitle>
                      <EmptyDescription>{t("library:noListsDescription")}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {listsQuery.data.items.map((list) => (
                      <ListItem key={list.id} list={list} />
                    ))}
                  </div>
                )}
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

              <TabsContent value="medias">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {item.backdrops?.map((url: string, i: number) => (
                    <ImageZoom key={i}>
                      <Image src={url} width={1920} height={1080} alt="Backdrop" />
                    </ImageZoom>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SeasonDetails {
  id: number;
  name: string;
  seasonNumber: number;
  numberOfEpisodes: number;
}

interface EpisodeWatch {
  season: number;
  episode: number;
  status: string;
}

type ProgressStatus = "Planning" | "Watching" | "Completed";

interface TvShowProgress {
  id: string;
  status: ProgressStatus;
  tvShowId: string;
  userId: string;
}

interface SeasonEpisodesProps {
  slug: string;
  seasonNumber: number;
  isOpen: boolean;
}

interface SeasonEpisode {
  episodeNumber: number;
  name: string;
  stillUrl: string;
}

function SeasonEpisodes({ slug, seasonNumber, isOpen }: SeasonEpisodesProps) {
  const { t } = useTranslation();
  const episodesQuery = useQuery<SeasonEpisode[]>({
    queryKey: ["tvSeasonEpisodes", slug, seasonNumber],
    queryFn: () => api.get(apiEndpoints.getTvShowSeasonEpisodes(slug, seasonNumber)).then(({ data }) => data.episodes),
    enabled: isOpen,
    staleTime: Infinity,
  });

  if (episodesQuery.isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-muted/40 animate-pulse aspect-video" />
        ))}
      </div>
    );
  }

  if (episodesQuery.isError) {
    return <ErrorComponent />;
  }

  if (!episodesQuery.data?.length) {
    return <p className="text-muted-foreground text-sm">{t("library:noEpisodes")}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {episodesQuery.data?.map((episode) => (
        <EpisodeItem
          key={episode.episodeNumber}
          title={episode.name}
          number={episode.episodeNumber}
          imageURL={episode.stillUrl}
        />
      ))}
    </div>
  );
}

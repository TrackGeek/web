import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Grid } from "@/components/layouts/grid.tsx";
import { CastItem, PersonLink } from "@/components/pages/details/cast";
import { CommunityStats } from "@/components/pages/details/community-stats";
import { DetailsPageLayout } from "@/components/pages/details/details-page-layout";
import { GenrePills } from "@/components/pages/details/genre-pills";
import { ListItem } from "@/components/pages/details/list";
import { MoreOptionsDialog } from "@/components/pages/details/more-options-dialog";
import { QuickStatusButtons } from "@/components/pages/details/quick-status-buttons";
import { ReviewItem } from "@/components/pages/details/review-item";
import { WatchProviders } from "@/components/pages/details/watch-providers";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { DetailsCard } from "@/components/shared/cards/details";
import { Comments } from "@/components/shared/comments";
import { CompanyLink } from "@/components/shared/company-link";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { MovieModal } from "@/components/shared/modals/movie";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToggleReviewReaction } from "@/hooks/review";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth/client";
import { ogUrl } from "@/lib/og/url";
import { cn, franchiseSlug } from "@/lib/utils";
import { formatLongDate } from "@/lib/utils/date";
import { getGenreLabel } from "@/lib/utils/genre-utils";
import { mediaJsonLd } from "@/lib/utils/json-ld";
import { seo } from "@/lib/utils/seo";
import { getStatusLabel } from "@/lib/utils/status.ts";

type MovieProgressStatus = "Planning" | "Watching" | "Completed" | "Paused" | "Dropped";

interface CastCredit {
  id: number;
  name: string;
  character: string;
  profileUrl: string | null;
  slug: string | null;
}

interface CrewCredit {
  id: number;
  name: string;
  job: string;
  profileUrl: string | null;
  slug: string | null;
}

interface MovieProgress {
  id: string;
  status: MovieProgressStatus;
}

export const Route = createFileRoute("/movie/$slug")({
  loader: async ({ params }) => {
    const movie = await api.get(apiEndpoints.getMovieDetails(params.slug)).then(({ data }) => data.movie);
    return { movie };
  },
  head: ({ params, loaderData }) => {
    const movie = loaderData?.movie;
    return {
      meta: [
        ...seo({
          title: movie?.title ? movie.title : "Movie Details",
          description: movie?.overview ?? undefined,
          image: ogUrl.media("movie", params.slug),
        }),
      ],
      scripts: [
        mediaJsonLd({
          type: "Movie",
          name: movie?.title,
          description: movie?.overview ?? undefined,
          image: movie?.posterUrl ?? undefined,
          rating: movie?.tgReviewScore ?? undefined,
          extra: {
            genre: movie?.genres,
            director: movie?.crew
              ?.filter((c: { job: string }) => c.job === "Director")
              .map((c: { name: string }) => ({ "@type": "Person", name: c.name })),
            duration: movie?.runtime > 0 ? `PT${movie.runtime}M` : undefined,
            datePublished: movie?.releaseDate ? new Date(movie.releaseDate).toISOString().slice(0, 10) : undefined,
          },
        }),
      ],
    };
  },
  component: MovieDetailsRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function MovieDetailsRoute() {
  const { slug } = Route.useParams();
  const { movie: loaderMovie } = Route.useLoaderData();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["movie", slug],
    queryFn: () => api.get(apiEndpoints.getMovieDetails(slug)).then(({ data }) => data.movie),
    initialData: loaderMovie,
  });
  const movie = data;

  const reviewsData = useQuery({
    queryKey: ["movieReviews", movie.id],
    queryFn: () => api.get(`${apiEndpoints.movieReview}/?movieId=${movie.id}`).then(({ data }) => data.movieReviews),
    enabled: !!movie?.id,
  });
  const reviews = reviewsData?.data;

  const rating = movie.tgReviewScore;
  const { t, i18n } = useTranslation();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return api.post(apiEndpoints.refreshMovieData, { id: Number(slug) });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["movie", slug] });
    },
    onError: () => {
      return toast.error(t("api:MOVIE_ALREADY_REFRESHED"));
    },
  });

  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  const userId = session?.data?.user?.id;

  const [moreOpen, setMoreOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  const toggleReaction = useToggleReviewReaction("movie", userId ?? "");

  const listsQuery = useQuery<ApiTypes.PaginatedResponse<ApiTypes.ListWithPreview>>({
    queryKey: ["movieContainingLists", movie?.id],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsContainingItemResponse>(apiEndpoints.getListsContainingItem, {
          params: { type: "Movie", movieId: movie?.id, itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists),
    enabled: !!movie?.id,
  });

  const favoriteQuery = useQuery<boolean>({
    queryKey: ["movieFavorite", movie?.id, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetFavoriteStatusResponse>(apiEndpoints.getFavoriteStatus, {
          params: { type: "Movie", movieId: movie?.id },
        })
        .then(({ data }) => data.favorited),
    enabled: isAuthenticated && !!userId && !!movie?.id,
  });

  const isFavorited = !!favoriteQuery.data;

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => {
      const body = { type: "Movie", movieId: movie?.id };

      return isFavorited
        ? api.delete(apiEndpoints.removeFavorite, { data: body })
        : api.post(apiEndpoints.addFavorite, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movieFavorite", movie?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["movieFavorite", movie?.id, userId] });
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  const userListsQuery = useQuery<ApiTypes.List[]>({
    queryKey: ["movieLists", userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Movie", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items),
    enabled: isAuthenticated && !!userId,
  });

  const listStatusQuery = useQuery<string[]>({
    queryKey: ["movieListStatus", movie?.id, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListStatusResponse>(apiEndpoints.getListStatus, {
          params: { type: "Movie", movieId: movie?.id },
        })
        .then(({ data }) => data.listIds),
    enabled: isAuthenticated && !!userId && !!movie?.id,
  });

  const toggleListMutation = useMutation({
    mutationFn: ({ listId, isMember }: { listId: string; isMember: boolean }) => {
      const body = { type: "Movie", listId, userId, movieId: movie?.id };
      return isMember
        ? api.delete(apiEndpoints.listItem(listId), { data: body })
        : api.post(apiEndpoints.listItem(listId), body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movieListStatus", movie?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["movieContainingLists", movie?.id] });
      queryClient.invalidateQueries({ queryKey: ["movie"] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const createAndAddListMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post(apiEndpoints.list, { name, userId, type: "Movie" });
      const freshLists = await api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Movie", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items);
      const newList = [...freshLists].reverse().find((l) => l.name === name);
      if (!newList) throw new Error("List not found after creation");
      await api.post(apiEndpoints.listItem(newList.id), {
        type: "Movie",
        listId: newList.id,
        userId,
        movieId: movie?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movieLists", userId] });
      queryClient.invalidateQueries({ queryKey: ["movieListStatus", movie?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["movieContainingLists", movie?.id] });
      setNewListName("");
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const progressQuery = useQuery<MovieProgress | null>({
    queryKey: ["movieProgress", movie?.id, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.getMovieProgress(userId as string, movie?.id as string))
        .then(({ data }) => data.movieProgresses.items[0] ?? null),
    enabled: isAuthenticated && !!userId && !!movie?.id,
  });

  const currentStatus = progressQuery.data?.status;

  const setProgressMutation = useMutation({
    mutationFn: (status: MovieProgressStatus) => {
      const current = progressQuery.data;

      if (current && current.status === status) {
        return api.delete(`${apiEndpoints.movieProgress}/${current.id}`);
      }

      return api.post(apiEndpoints.movieProgress, { movieId: movie?.id, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movieProgress", movie?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["movie", slug] });
    },
    onError: () => {
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  if (isLoading || reviewsData.isLoading) {
    return <LoadingDetails />;
  }

  if (isError || reviewsData.isError || !movie) {
    return <ErrorComponent />;
  }

  const directors: CrewCredit[] = (movie.crew ?? []).filter((c: CrewCredit) => c.job === "Director");

  const sidebar = (
    <>
      <div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
        <Image
          src={movie.posterUrl || "/placeholder/cover.webp"}
          width={500}
          height={750}
          alt={`${movie.name} Cover`}
          className="w-full h-auto object-cover"
        />
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
                isActive: currentStatus === "Planning",
                disabled: setProgressMutation.isPending,
                activeClass: "border-purple-400 bg-purple-400/20",
                onClick: () => setProgressMutation.mutate("Planning"),
              },
              {
                label: t("feed:lists.completed"),
                icon: "lucide:check-square",
                hoverBorder: "hover:border-chart-3",
                hoverBg: "hover:bg-chart-3/20",
                iconBg: "bg-linear-to-r from-chart-3/20 to-amber-500/20",
                iconBorder: "border-chart-3/30",
                iconColor: "text-chart-3",
                isActive: currentStatus === "Completed",
                disabled: setProgressMutation.isPending,
                activeClass: "border-chart-3 bg-chart-3/20",
                onClick: () => setProgressMutation.mutate("Completed"),
              },
              {
                label: t("feed:lists.dropped"),
                icon: "lucide:trash",
                hoverBorder: "hover:border-chart-5",
                hoverBg: "hover:bg-chart-5/20",
                iconBg: "bg-linear-to-r from-chart-5/20 to-red-500/20",
                iconBorder: "border-chart-5/30",
                iconColor: "text-chart-5",
                isActive: currentStatus === "Dropped",
                disabled: setProgressMutation.isPending,
                activeClass: "border-chart-5 bg-chart-5/20",
                onClick: () => setProgressMutation.mutate("Dropped"),
              },
            ]}
          />
          <MoreOptionsDialog
            title={movie.title}
            coverUrl={movie.posterUrl}
            rating={rating}
            subtitle={String(new Date(movie.releaseDate as string).getFullYear())}
            description={movie.overview}
            triggerLabel={t("library:moreOptions")}
            open={moreOpen}
            onOpenChange={setMoreOpen}
            isFavorited={isFavorited}
            favoriteDisabled={toggleFavoriteMutation.isPending || favoriteQuery.isFetching}
            onToggleFavorite={() => toggleFavoriteMutation.mutate()}
          >
            <MovieModal movieId={movie.id} onClose={() => setMoreOpen(false)} />
          </MoreOptionsDialog>
        </>
      )}

      <div className="border-t border-border" />

      <Grid minColSize={"128px"} className="gap-4">
        <div className="bg-muted/50 p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">{t("common:status")}</p>
          <p className="font-semibold text-card-foreground">{getStatusLabel(t, movie.status)}</p>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">{t("common:releaseDate")}</p>
          <p className="font-semibold text-card-foreground">{formatLongDate(movie.releaseDate, i18n.language)}</p>
        </div>
      </Grid>
      {isAuthenticated && (
        <RefreshData
          lastRefreshedAt={movie.lastRefreshedAt}
          sourceURL={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
          onSubmit={() => mutation.mutate()}
        />
      )}
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {movie.homepage && (
          <a href={movie.homepage} target="_blank" rel="noopener noreferrer">
            <Icon icon={"lucide:external-link"} />
          </a>
        )}
        {(() => {
          const ext = movie?.external || ({} as Record<string, string>);
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
          if (movie.imdbId) {
            links.push({
              href: `https://www.imdb.com/title/${movie.imdbId}`,
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
    <>
      <DetailsPageLayout sidebar={sidebar}>
        <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text break-words">
          {movie.title}
        </h1>

        {movie?.belongsToCollection?.name && (
          <div className="flex items-center space-x-2">
            <Icon icon={"lucide:box"} className="size-5 text-muted-foreground" />
            <Link
              to={"/movie/franchises/$slug"}
              params={{
                slug: franchiseSlug(movie.belongsToCollection.id, movie.belongsToCollection.name),
              }}
              className="text-xl text-muted-foreground"
            >
              {movie.belongsToCollection.name}
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-6 border-b border-border">
          <div className="flex items-center mb-3 space-x-1">
            <StarRating value={rating} className="mr-1" />
            <span className="font-semibold text-card-foreground">{rating}</span>
            <span className="text-muted-foreground">({t("common:reviewCount", { count: reviews?.total ?? 0 })})</span>
          </div>
        </div>

        <Tabs defaultValue="info">
          <div className="mb-2 min-w-0 overflow-x-auto">
            <TabsList className="w-max min-w-full items-center justify-start">
              <TabsTrigger value="info">{t("library:info")}</TabsTrigger>
              <TabsTrigger value="cast">{t("common:types.cast")}</TabsTrigger>
              <TabsTrigger value="lists">
                {t("common:lists")} ({listsQuery.data?.total ?? 0})
              </TabsTrigger>
              <TabsTrigger value="comments">{t("comments:title")}</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="info" className={"space-y-5"}>
            <div className={"space-y-3"}>
              <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>
              <h3 className="font-semibold text-card-foreground text-lg">{t("library:genres")}</h3>
              <GenrePills genres={movie.genres} type="movie" getLabel={(g) => getGenreLabel(t, g)} />
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:movieCharacteristics")}</h3>
              <Grid minColSize={"200px"} className="gap-4">
                {directors.length > 0 && (
                  <DetailsCard
                    title={t("library:directors")}
                    icon={<Icon icon={"lucide:clapperboard"} className="size-5 text-muted-foreground" />}
                    description={
                      <span className="flex flex-wrap gap-x-1.5">
                        {directors.map((director, index) => (
                          <span key={director.id}>
                            <PersonLink slug={director.slug}>{director.name}</PersonLink>
                            {index < directors.length - 1 && ","}
                          </span>
                        ))}
                      </span>
                    }
                  />
                )}
                {movie.budget > 0 && (
                  <DetailsCard
                    title={t("library:budget")}
                    icon={<Icon icon={"lucide:piggy-bank"} className="size-5 text-muted-foreground" />}
                    description={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                      movie.budget,
                    )}
                  />
                )}
                {movie.revenue > 0 && (
                  <DetailsCard
                    title={t("library:revenue")}
                    icon={<Icon icon={"lucide:ticket"} className="size-5 text-muted-foreground" />}
                    description={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                      movie.revenue,
                    )}
                  />
                )}
                {movie?.spokenLanguages[0]?.name && (
                  <DetailsCard
                    title={t("common:language")}
                    icon={<Icon icon={"lucide:languages"} className="size-5 text-muted-foreground" />}
                    description={movie?.spokenLanguages[0]?.name}
                  />
                )}
                {movie?.productionCompanies?.length >= 1 && (
                  <DetailsCard
                    title={t("library:productionCompanies")}
                    icon={<Icon icon={"lucide:building"} className="size-5 text-muted-foreground" />}
                    description={
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate">
                          <CompanyLink mediaType="movie" id={movie.productionCompanies[0].id}>
                            {movie.productionCompanies[0].name}
                          </CompanyLink>
                        </span>
                        {movie.productionCompanies.length > 1 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="shrink-0 cursor-default rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                                +{movie.productionCompanies.length - 1}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <ul className="flex flex-col gap-0.5">
                                {movie.productionCompanies.slice(1).map((pc: { id: number; name: string }) => (
                                  <li key={pc.id}>
                                    <CompanyLink mediaType="movie" id={pc.id}>
                                      {pc.name}
                                    </CompanyLink>
                                  </li>
                                ))}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    }
                  />
                )}
                {movie.runtime > 0 && (
                  <DetailsCard
                    title={t("library:runtime")}
                    icon={<Icon icon={"lucide:clock"} className="size-5 text-muted-foreground" />}
                    description={`${movie.runtime} min`}
                  />
                )}
              </Grid>
            </div>

            <WatchProviders mediaType="movie" slug={slug} />

            <div>
              <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:communityStatistics")}</h3>
              <CommunityStats
                stats={[
                  {
                    label: t("feed:lists.planning"),
                    icon: "lucide:bookmark",
                    iconClass: "text-purple-400",
                    value: `${movie.progressStats?.planToWatch?.percentage ?? 0}%`,
                    sub: t("common:userCount", { count: movie.progressStats?.planToWatch?.count ?? 0 }),
                  },
                  {
                    label: t("feed:lists.completed"),
                    icon: "lucide:check-circle",
                    iconClass: "text-secondary",
                    value: `${movie.progressStats?.completed?.percentage ?? 0}%`,
                    sub: t("common:userCount", { count: movie.progressStats?.completed?.count ?? 0 }),
                  },
                  {
                    label: t("feed:lists.paused"),
                    icon: "lucide:pause",
                    iconClass: "text-chart-5",
                    value: `${movie.progressStats?.paused?.percentage ?? 0}%`,
                    sub: t("common:userCount", { count: movie.progressStats?.paused?.count ?? 0 }),
                  },
                  {
                    label: t("feed:lists.dropped"),
                    icon: "lucide:x-circle",
                    iconClass: "text-destructive",
                    value: `${movie.progressStats?.dropped?.percentage ?? 0}%`,
                    sub: t("common:userCount", { count: movie.progressStats?.dropped?.count ?? 0 }),
                  },
                ]}
              />
            </div>

            {(movie.trailerId || movie.backdrops.length >= 1) && (
              <Carousel className="w-full" opts={{ loop: true, align: "center" }}>
                <CarouselContent>
                  {movie.trailerId && (
                    <CarouselItem>
                      <div className="relative w-full overflow-hidden pt-[56.25%]">
                        <iframe
                          src={`https://youtube.com/embed/${movie.trailerId}`}
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                          title="Trailer"
                        />
                      </div>
                    </CarouselItem>
                  )}
                  {movie.backdrops?.map((url: string, i: number) => (
                    <CarouselItem key={i}>
                      <div className="relative w-full overflow-hidden pt-[56.25%]">
                        <div
                          className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
                          style={{ backgroundImage: `url(${url})` }}
                          aria-hidden="true"
                        />
                        <ImageZoom className="absolute inset-0">
                          <img src={url} alt={"Backdrop"} className="absolute inset-0 w-full h-full object-contain" />
                        </ImageZoom>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious variant="default" className="left-2" />
                <CarouselNext variant="default" className="right-2" />
              </Carousel>
            )}
          </TabsContent>
          <TabsContent value="lists" className="space-y-4">
            {isAuthenticated && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Icon icon="lucide:list-plus" className="size-3.5" />
                    {t("feed:customLists")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-56 p-2 space-y-2">
                  <div className="flex items-center gap-1.5 pb-1.5 border-b border-border">
                    <Input
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder={t("feed:newList")}
                      className="h-7 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newListName.trim()) {
                          createAndAddListMutation.mutate(newListName.trim());
                        }
                      }}
                    />
                    <Button
                      size="icon"
                      className="size-7 shrink-0"
                      disabled={!newListName.trim() || createAndAddListMutation.isPending}
                      onClick={() => createAndAddListMutation.mutate(newListName.trim())}
                    >
                      <Icon icon="lucide:plus" className="size-3.5" />
                    </Button>
                  </div>
                  <div className="space-y-0.5">
                    {userListsQuery.data?.map((list) => {
                      const isMember = listStatusQuery.data?.includes(list.id) ?? false;
                      return (
                        <label
                          key={list.id}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-muted cursor-pointer text-sm select-none"
                        >
                          <Checkbox
                            checked={isMember}
                            disabled={toggleListMutation.isPending}
                            onCheckedChange={() => toggleListMutation.mutate({ listId: list.id, isMember })}
                          />
                          {list.name}
                        </label>
                      );
                    })}
                    {(!userListsQuery.data || userListsQuery.data.length === 0) && (
                      <p className="text-sm text-muted-foreground px-2 py-1.5">{t("library:noLists")}</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}

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
          <TabsContent value="comments">
            <Comments
              type="Movie"
              movieId={movie.id}
              showTitle={false}
              containerClassName="border-0 bg-transparent p-0 shadow-none"
              headerClassName="p-0"
              contentClassName="p-0"
            />
          </TabsContent>
          <TabsContent value="cast">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {movie.cast?.map((cast: CastCredit) => (
                <CastItem
                  key={`${cast.id}-${cast.character}`}
                  name={cast.name}
                  character={cast.character}
                  imageUrl={cast.profileUrl}
                  slug={cast.slug}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DetailsPageLayout>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-card-foreground text-lg capitalize">
            {t("common:reviews")} ({reviews?.total ?? 0})
          </h3>
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-2"
              onClick={() => {
                if (currentStatus !== "Completed") {
                  setProgressMutation.mutate("Completed");
                }
                setMoreOpen(true);
              }}
            >
              <Icon icon="lucide:pen-line" className="size-4" />
              {t("feed:review")}
            </Button>
          )}
        </div>
        {!reviews || reviews.items.length === 0 ? (
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
            {reviews.items.map((review: ApiTypes.Review) => (
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
                    { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["movieReviews", movie.id] }) },
                  )
                }
                isReacting={toggleReaction.isPending && toggleReaction.variables?.reviewId === review.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { type ReactElement, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Grid } from "@/components/layouts/grid.tsx";
import { CastItem } from "@/components/pages/details/cast";
import { CommunityStats } from "@/components/pages/details/community-stats";
import { DetailsPageLayout } from "@/components/pages/details/details-page-layout";
import { GenrePills } from "@/components/pages/details/genre-pills";
import { ListItem } from "@/components/pages/details/list";
import { MoreOptionsDialog } from "@/components/pages/details/more-options-dialog";
import { QuickStatusButtons } from "@/components/pages/details/quick-status-buttons";
import { ReviewItem } from "@/components/pages/details/review-item";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { DetailsCard } from "@/components/shared/cards/details";
import { Comments } from "@/components/shared/comments";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { MovieModal } from "@/components/shared/modals/movie";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { StarRating } from "@/components/shared/star-rating";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToggleReviewReaction } from "@/hooks/review";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { cn } from "@/lib/utils";
import { getGenreLabel } from "@/lib/utils/genre-utils";
import { seo } from "@/lib/utils/seo";
import { getStatusLabel } from "@/lib/utils/status.ts";

type MovieProgressStatus = "Planning" | "Watching" | "Completed" | "Paused" | "Dropped";

interface MovieProgress {
  id: string;
  status: MovieProgressStatus;
}

export const Route = createFileRoute("/movie/$slug")({
  loader: async ({ params }) => {
    const movie = await api.get(apiEndpoints.getMovieDetails(params.slug)).then(({ data }) => data.movie);
    return { movie };
  },
  head: ({ loaderData }) => {
    const movie = loaderData?.movie;
    return {
      meta: [
        ...seo({
          title: movie?.title ? movie.title : "Movie Details",
          description: movie?.overview ?? undefined,
          image: movie?.posterUrl ?? undefined,
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
  const { t } = useTranslation();

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
          <p className="text-sm text-muted-foreground">{t("library:status")}</p>
          <p className="font-semibold text-card-foreground">{getStatusLabel(t, movie.status)}</p>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">{t("library:releaseDate")}</p>
          <p className="font-semibold text-card-foreground">{new Date(movie.releaseDate as string).getFullYear()}</p>
        </div>
      </Grid>
      <RefreshData sourceURL={`https://www.themoviedb.org/movie/${movie.tmdbId}`} onSubmit={() => mutation.mutate()} />
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
    <DetailsPageLayout sidebar={sidebar}>
      <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
        {movie.title}
      </h1>

      {/* {movie?.belongsToCollection?.name && (
        <div className="flex items-center space-x-2">
          <Icon icon={"lucide:box"} className="size-5 text-muted-foreground" />
          <a href={`/movies-collection/${movie?.belongsToCollection?.id}`} className="text-xl text-muted-foreground">
            {movie?.belongsToCollection?.name}
          </a>
        </div>
      )} */}

      <div className="flex flex-wrap items-center gap-6 border-b border-border">
        <div className="flex items-center mb-3 space-x-1">
          <StarRating value={rating} className="mr-1" />
          <span className="font-semibold text-card-foreground">{rating}</span>
          <span className="text-muted-foreground">
            ({reviews.total} {t("library:reviews")})
          </span>
        </div>
      </div>

      <Tabs defaultValue="info">
        <div className="flex items-center justify-between gap-3 mb-2">
          <TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
            <TabsTrigger value="info">{t("library:info")}</TabsTrigger>
            <TabsTrigger value="cast">{t("library:cast")}</TabsTrigger>
            {movie.backdrops.length >= 1 && <TabsTrigger value="medias">{t("library:medias")}</TabsTrigger>}
            <TabsTrigger value="reviews" className="capitalize">
              {t("library:reviews")} ({reviews?.total ?? 0})
            </TabsTrigger>
            <TabsTrigger value="lists">
              {t("library:lists")} ({listsQuery.data?.total ?? 0})
            </TabsTrigger>
            <TabsTrigger value="comments">{t("comments:title")}</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="info" className={"space-y-5"}>
          <div>
            <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:genres")}</h3>
            <GenrePills genres={movie.genres} getLabel={(g) => getGenreLabel(t, g)} />
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:synopsis")}</h3>
            <div className="text-muted-foreground leading-relaxed space-y-4">
              <p>{movie.overview}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:movieCharacteristics")}</h3>
            <Grid minColSize={"200px"} className="gap-4">
              <DetailsCard
                title={t("library:directors")}
                icon={<Icon icon={"lucide:clapperboard"} className="size-5 text-muted-foreground" />}
                description={
                  <Link to="/" search={{ landing: "true" }} className="font-medium text-card-foreground">
                    Tom Gormican
                  </Link>
                }
              />
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
                  title={t("library:language")}
                  icon={<Icon icon={"lucide:languages"} className="size-5 text-muted-foreground" />}
                  description={movie?.spokenLanguages[0]?.name}
                />
              )}
              {movie?.productionCompanies?.length >= 1 && (
                <DetailsCard
                  title={t("library:productionCompanies")}
                  icon={<Icon icon={"lucide:building"} className="size-5 text-muted-foreground" />}
                  description={
                    <span className="inline-flex items-center gap-1.5">
                      <span className="truncate">{movie.productionCompanies[0].name}</span>
                      {movie.productionCompanies.length > 1 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="shrink-0 cursor-default rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                              +{movie.productionCompanies.length - 1}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <ul className="flex flex-col gap-0.5">
                              {movie.productionCompanies.slice(1).map((pc: { name: string }) => (
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
              {movie.runtime > 0 && (
                <DetailsCard
                  title={t("library:runtime")}
                  icon={<Icon icon={"lucide:clock"} className="size-5 text-muted-foreground" />}
                  description={`${movie.runtime} min`}
                />
              )}
            </Grid>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:communityStatistics")}</h3>
            <CommunityStats
              stats={[
                {
                  label: t("feed:lists.planning"),
                  icon: "lucide:bookmark",
                  iconClass: "text-purple-400",
                  value: `${movie.progressStats?.planToWatch?.percentage ?? 0}%`,
                  sub: `${movie.progressStats?.planToWatch?.count ?? 0} ${t("library:users")}`,
                },
                {
                  label: t("feed:lists.watching"),
                  icon: "lucide:tv-minimal-play",
                  iconClass: "text-chart-1",
                  value: `${movie.progressStats?.watching?.percentage ?? 0}%`,
                  sub: `${movie.progressStats?.watching?.count ?? 0} ${t("library:users")}`,
                },
                {
                  label: t("feed:lists.completed"),
                  icon: "lucide:check-circle",
                  iconClass: "text-secondary",
                  value: `${movie.progressStats?.completed?.percentage ?? 0}%`,
                  sub: `${movie.progressStats?.completed?.count ?? 0} ${t("library:users")}`,
                },
                {
                  label: t("feed:lists.dropped"),
                  icon: "lucide:x-circle",
                  iconClass: "text-destructive",
                  value: `${movie.progressStats?.dropped?.percentage ?? 0}%`,
                  sub: `${movie.progressStats?.dropped?.count ?? 0} ${t("library:users")}`,
                },
              ]}
            />
          </div>

          {movie.trailerId && (
            <iframe
              src={`https://youtube.com/embed/${movie.trailerId}`}
              allowFullScreen
              className="w-full aspect-video"
              title="Trailer"
            />
          )}
        </TabsContent>
        <TabsContent value="reviews">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {movie.cast?.map((cast: { character: string; name: string; profileUrl: string }) => (
              <CastItem key={cast.character} name={cast.name} character={cast.character} imageUrl={cast.profileUrl} />
            ))}
          </div>
        </TabsContent>
        {movie.backdrops.length >= 1 && (
          <TabsContent value="medias">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {movie.backdrops?.map((url: string, i: number) => (
                <ImageZoom key={i}>
                  <img src={url} alt={"Backdrop"} />
                </ImageZoom>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </DetailsPageLayout>
  );
}

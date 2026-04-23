import {
  SiFacebook,
  SiFacebookHex,
  SiImdb,
  SiImdbHex,
  SiInstagram,
  SiInstagramHex,
  SiX,
} from "@icons-pack/react-simple-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bookmark,
  Box,
  Building,
  CheckCircle,
  CheckSquare,
  Clapperboard,
  Clock,
  ExternalLink,
  Heart,
  Languages,
  MoreHorizontal,
  Pause,
  PiggyBank,
  Star,
  Ticket,
  Trash,
  XCircle,
} from "lucide-react";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Grid } from "@/components/layouts/grid.tsx";
import { CastItem } from "@/components/pages/details/cast";
import { ListItem } from "@/components/pages/details/list";
import { ReviewItem } from "@/components/pages/details/review";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { DetailsCard } from "@/components/shared/cards/details";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { MovieModal } from "@/components/shared/modals/movie";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { cn } from "@/lib/utils";
import { getGenreLabel } from "@/lib/utils/genre-utils";
import { seo } from "@/lib/utils/seo";
import { getStatusLabel } from "@/lib/utils/status.ts";

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

  const rating = 4.2;
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
  if (isLoading || reviewsData.isLoading) return <LoadingDetails />;
  if (isError || reviewsData.isError || !movie) return <ErrorComponent />;
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3">
        <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 gap-4 flex flex-col">
          <div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
            <img src={movie.posterUrl} alt={`${movie.title} Cover`} className="w-full h-auto object-cover" />
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

                <Button className="size-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-chart-5 transition-all duration-300 bg-card hover:bg-chart-5/20">
                  <div className="flex flex-col items-center gap-x-4 gap-2">
                    <div className="size-10 rounded-full bg-linear-to-r from-chart-5/20 to-red-500/20 flex items-center justify-center border border-chart-5/30">
                      <Trash className="text-chart-5 size-6" />
                    </div>
                    <p className="font-medium text-card-foreground text-center text-base">{t("feed:lists.dropped")}</p>
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
                      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url("${movie.posterUrl}")`,
                    }}
                  >
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
                    <div className="flex flex-row items-center w-full">
                      <img
                        src={movie.posterUrl}
                        alt="Cover"
                        className="w-28 h-40 object-cover rounded-lg shadow-2xl relative z-10 border-2 border-white/30"
                      />
                      <div className="flex-1 px-6 relative z-10">
                        <DialogTitle className="text-white font-bold text-2xl drop-shadow-lg mb-2">
                          {movie.title}
                        </DialogTitle>
                        <div className="flex items-center gap-4 text-white/90 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="size-4 fill-yellow-400 text-yellow-400" />
                            <span>{rating}</span>
                          </div>
                          <span>•</span>
                          <span>{new Date(movie.releaseDate as string).getFullYear()}</span>
                        </div>
                        <p className="text-white/80 text-sm mt-2 max-w-md line-clamp-2">{movie.overview}</p>
                      </div>
                    </div>

                    <div className="absolute z-50 top-[45%] right-10 flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                        <Heart className="size-6" />
                      </Button>
                    </div>
                  </DialogHeader>

                  <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
                    <MovieModal />
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          <div className="border-t border-border"></div>

          <Grid minColSize={"128px"} className="gap-4">
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">{t("library:status")}</p>
              <p className="font-semibold text-card-foreground">{getStatusLabel(t, movie.status)}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">{t("library:releaseDate")}</p>
              <p className="font-semibold text-card-foreground">
                {new Date(movie.releaseDate as string).getFullYear()}
              </p>
            </div>
          </Grid>
          <RefreshData
            sourceURL={`https://www.themoviedb.org/movie/${movie.tmdbId}`}
            onSubmit={() => {
              mutation.mutate();
            }}
          />
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {movie.homepage && (
              <a href={movie.homepage} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
              </a>
            )}
            {(() => {
              const ext = movie?.external || ({} as Record<string, any>);
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

              if (movie.imdbId) {
                links.push({
                  href: `https://www.imdb.com/title/${movie.imdbId}`,
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
            {movie.title}
          </h1>
          {movie?.belongsToCollection?.name && (
            <div className="flex items-center space-x-2">
              <Box className="size-5 text-muted-foreground" />
              <a
                href={`/movies-collection/${movie?.belongsToCollection?.id}`}
                className="text-xl text-muted-foreground"
              >
                {movie?.belongsToCollection?.name}
              </a>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-6 border-b border-border">
            {reviews?.total >= 1 && (
              <div className="flex items-center mb-5">
                <div className="flex mr-2">
                  <Star className="size-5 text-chart-3 fill-chart-3" />
                  <Star className="size-5 text-chart-3 fill-chart-3" />
                  <Star className="size-5 text-chart-3 fill-chart-3" />
                  <Star className="size-5 text-chart-3 fill-chart-3" />
                  <Star className="size-5 text-muted-foreground" />
                </div>
                <span className="font-semibold text-card-foreground">{rating}</span>
                <span className="text-muted-foreground ml-1">
                  ({reviews?.total} {t("library:reviews")})
                </span>
              </div>
            )}
          </div>
          <Tabs defaultValue="info">
            <div className="flex items-center justify-between gap-3 mb-2">
              <TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
                <TabsTrigger value="info">{t("library:info")}</TabsTrigger>
                <TabsTrigger value="cast">{t("library:cast")}</TabsTrigger>
                {movie.backdrops.length >= 1 && <TabsTrigger value="medias">{t("library:medias")}</TabsTrigger>}
                {reviews?.total >= 1 && (
                  <TabsTrigger value="reviews" className="capitalize">
                    {t("library:reviews")} ({reviews?.total})
                  </TabsTrigger>
                )}
                <TabsTrigger value="lists">{t("library:lists")} (30)</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="info" className={"space-y-5"}>
              <div>
                <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:genres")}</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre: string, index: number) => {
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
                <div className="text-muted-foreground leading-relaxed space-y-4">
                  <p>{movie.overview}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:movieCharacteristics")}</h3>
                <Grid minColSize={"200px"} className="gap-4">
                  <DetailsCard
                    title={t("library:directors")}
                    icon={<Clapperboard className="size-5 text-muted-foreground" />}
                    description={
                      <Link to="/" search={{ landing: "true" }} className="font-medium text-card-foreground">
                        Tom Gormican
                      </Link>
                    }
                  />
                  {movie.budget > 0 && (
                    <DetailsCard
                      title={t("library:budget")}
                      icon={<PiggyBank className="size-5 text-muted-foreground" />}
                      description={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                        movie.budget,
                      )}
                    />
                  )}
                  {movie.revenue > 0 && (
                    <DetailsCard
                      title={t("library:revenue")}
                      icon={<Ticket className="size-5 text-muted-foreground" />}
                      description={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
                        movie.revenue,
                      )}
                    />
                  )}
                  {movie?.spokenLanguages[0]?.name && (
                    <DetailsCard
                      title={t("library:language")}
                      icon={<Languages className="size-5 text-muted-foreground" />}
                      description={movie?.spokenLanguages[0]?.name}
                    />
                  )}
                  {movie?.productionCompanies?.length >= 1 && (
                    <DetailsCard
                      title={t("library:productionCompanies")}
                      icon={<Building className="size-5 text-muted-foreground" />}
                      description={movie.productionCompanies
                        .map((pc: { name: string }) => {
                          return pc.name;
                        })
                        .join(", ")}
                    />
                  )}
                  {movie.runtime > 0 && (
                    <DetailsCard
                      title={t("library:runtime")}
                      icon={<Clock className="size-5 text-muted-foreground" />}
                      description={`${movie.runtime} min`}
                    />
                  )}
                </Grid>
              </div>

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
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.completed")}</span>
                      <CheckCircle className="size-5 text-secondary" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">72%</p>
                  </div>

                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.paused")}</span>
                      <Pause className="size-5 text-chart-3" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">15%</p>
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
                {movie.cast?.map((cast: { character: string; name: string; profileUrl: string }) => {
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
        </div>
      </div>
    </div>
  );
}

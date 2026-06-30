import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Grid } from "@/components/layouts/grid.tsx";
import { CharacterItem } from "@/components/pages/details/character";
import { Relations } from "@/components/pages/details/relations";
import { ReviewItem } from "@/components/pages/details/review";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { DetailsCard } from "@/components/shared/cards/details";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { MangaModal } from "@/components/shared/modals/manga";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { cn } from "@/lib/utils";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/manga/$slug")({
  loader: async ({ params }) => {
    const manga = await api.get(apiEndpoints.getMangaDetails(params.slug)).then(({ data }) => data.manga);
    return { manga };
  },
  head: ({ loaderData }) => {
    const manga = loaderData?.manga;
    return {
      meta: [
        ...seo({
          title: manga?.title ? manga.title : "Manga Details",
          description: manga?.synopsis ?? undefined,
          image: manga?.imageUrl ?? undefined,
        }),
      ],
    };
  },
  component: MangaDetailsRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function MangaDetailsRoute() {
  const { slug } = Route.useParams();
  const { manga: loaderManga } = Route.useLoaderData();

  const rating = 4.2;
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["manga", slug],
    queryFn: () => api.get(apiEndpoints.getMangaDetails(slug)).then(({ data }) => data.manga),
    initialData: loaderManga,
  });
  const manga = data;

  const reviewsData = useQuery({
    queryKey: ["mangaReviews", manga.id],
    queryFn: () => api.get(`${apiEndpoints.mangaReview}/?mangaId=${manga.id}`).then(({ data }) => data.mangaReviews),
    enabled: !!manga?.id,
  });
  const reviews = reviewsData?.data ?? { total: 0 };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return api.post(apiEndpoints.refreshMangaData, { malId: Number(slug) });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["manga", slug] });
    },
    onError: () => {
      return toast.error(t("api:MANGA_ALREADY_REFRESHED"));
    },
  });

  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  if (isLoading || reviewsData.isLoading) return <LoadingDetails />;
  if (isError || reviewsData.isError || !manga) return <ErrorComponent />;
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="lg:w-1/3">
        <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-6 flex flex-col gap-4">
          <div className="w-full mx-auto shadow-xl rounded-lg overflow-hidden">
            <img
              src={manga.imageUrl || "/placeholder/cover.webp"}
              alt={`${manga.title} Cover`}
              className="w-full h-auto object-cover"
            />
          </div>

          {isAuthenticated && (
            <>
              <div className="grid grid-cols-3 w-full gap-4">
                <Button className="size-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-purple-400 transition-all duration-300 bg-card hover:bg-purple-400/20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-10 rounded-full bg-linear-to-r from-purple-500/20 to-violet-500/20 flex items-center justify-center border border-purple-500/30">
                      <Icon icon={"lucide:bookmark"} className="size-6 text-purple-400" />
                    </div>
                    <p className="font-medium text-card-foreground text-center text-base">{t("feed:lists.planning")}</p>
                  </div>
                  <div className="status-indicator hidden">
                    <Icon icon={"lucide:check-circle"} className="size-6 text-secondary" />
                  </div>
                </Button>

                <Button className="size-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-primary transition-all duration-300 bg-card hover:bg-primary/20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-10 rounded-full bg-linear-to-r from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30">
                      <Icon icon={"lucide:book-open-text"} className="size-6 text-primary" />
                    </div>
                    <p className="font-medium text-card-foreground text-center text-base">{t("feed:lists.reading")}</p>
                  </div>
                  <div className="status-indicator hidden">
                    <Icon icon={"lucide:check-circle"} className="size-6 text-secondary" />
                  </div>
                </Button>

                <Button className="size-full flex flex-col items-center justify-between p-4 rounded-xl border-2 border-border hover:border-chart-3 transition-all duration-300 bg-card hover:bg-chart-3/20">
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-10 rounded-full bg-linear-to-r from-chart-3/20 to-amber-500/20 flex items-center justify-center border border-chart-3/30">
                      <Icon icon={"lucide:check-square"} className="size-6 text-chart-3" />
                    </div>
                    <p className="font-medium text-card-foreground text-center text-base">{t("feed:lists.read")}</p>
                  </div>
                  <div className="status-indicator hidden">
                    <Icon icon={"lucide:check-circle"} className="size-6 text-secondary" />
                  </div>
                </Button>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex bg-transparent items-center justify-center gap-2 w-full py-3 text-muted-foreground hover:text-card-foreground hover:bg-muted rounded-lg transition-all duration-300">
                    <Icon icon={"lucide:more-horizontal"} className="size-5" />
                    <span className="text-sm font-medium">{t("library:moreOptions")}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-hidden p-0">
                  <DialogHeader
                    className="h-48 p-0 flex flex-row items-center bg-cover bg-center px-6 relative"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url("${manga.imageUrl || "/placeholder/cover.webp"}")`,
                    }}
                  >
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/20" />
                    <div className="flex flex-row items-center w-full">
                      <img
                        src={manga.imageUrl || "/placeholder/cover.webp"}
                        alt="Cover"
                        className="w-28 h-40 object-cover rounded-lg shadow-2xl relative z-10 border-2 border-white/30"
                      />
                      <div className="flex-1 px-6 relative z-10 space-y-2">
                        <DialogTitle className="text-white font-bold text-2xl drop-shadow-lg">
                          {manga.title}
                        </DialogTitle>
                        <div className="flex items-center gap-4 text-white/90 text-sm">
                          <div className="flex items-center gap-1">
                            <Icon icon={"lucide:star"} className="size-4 fill-yellow-400 text-yellow-400" />
                            <span>{rating}</span>
                          </div>
                          <span>•</span>
                          <span>{manga.published.string}</span>
                        </div>
                        <p className="text-white/80 text-sm max-w-md line-clamp-2">{manga.synopsis}</p>
                      </div>
                    </div>

                    <div className="absolute z-50 top-[45%] right-10 flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                        <Icon icon={"lucide:heart"} className="size-6" />
                      </Button>
                    </div>
                  </DialogHeader>

                  <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
                    <MangaModal />
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          <div className="border-t border-border" />

          <Grid minColSize={"128px"} className="gap-4">
            {manga.status && (
              <div className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">{t("library:status")}</p>
                <p className="font-semibold text-card-foreground">{manga.status}</p>
              </div>
            )}
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">{t("library:releaseDate")}</p>
              <p className="font-semibold text-card-foreground">{manga.published.string}</p>
            </div>
          </Grid>
          <RefreshData
            sourceURL={manga.url}
            onSubmit={() => {
              mutation.mutate();
            }}
          />
          {manga.external.length >= 1 && (
            <div className="flex flex-wrap gap-3 items-center justify-center">
              {(() => {
                const extArr = manga.external || [];
                const links: any[] = [];

                extArr.forEach((e: { url: string; name: string }, i: number) => {
                  const name = (e.name || "").toLowerCase();
                  const url = e.url;

                  if (/official/i.test(name)) {
                    links.push({ href: url, key: `official-${i}`, icon: <Icon icon={"lucide:external-link"} /> });
                    return;
                  }

                  if (name.includes("instagram")) {
                    links.push({
                      href: url,
                      key: `instagram-${i}`,
                      className: cn(`hover:text-[#FF0069]`),
                      icon: <Icon icon={"simple-icons:instagram"} />,
                    });
                    return;
                  }

                  if (name.includes("facebook")) {
                    links.push({
                      href: url,
                      key: `facebook-${i}`,
                      className: cn(`hover:text-[#0866FF]`),
                      icon: <Icon icon={"simple-icons:facebook"} />,
                    });
                    return;
                  }

                  if (name.startsWith("@")) {
                    links.push({
                      href: url,
                      key: `twitter-${i}`,
                      className: cn("hover:text-white"),
                      icon: <Icon icon={"simple-icons:x"} />,
                    });
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
                      className: cn(`hover:text-[#000000]`),
                      icon: <Icon icon={"simple-icons:wikipedia"} />,
                    });
                    return;
                  }

                  links.push({ href: url, key: `link-${i}`, icon: <Icon icon={"lucide:external-link"} /> });
                });

                if (manga.malId) {
                  links.push({
                    href: `https://myanimelist.net/manga/${manga.malId}`,
                    key: "mal",
                    icon: <Icon icon={"simple-icons:myanimelist"} />,
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
            {manga.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 border-b border-border pb-5">
            {reviews.total >= 1 && (
              <div className="flex items-center gap-2">
                <div className="flex">
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
                <TabsTrigger value="relations">{t("library:relations")}</TabsTrigger>
                <TabsTrigger value="characters">{t("library:characters")}</TabsTrigger>
                {reviews.total >= 1 && (
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
                  {manga.genres.map((genre: string, index: number) => {
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
                <p className="text-muted-foreground leading-relaxed">{manga.synopsis}</p>
              </div>

              <div>
                <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:mangaCharacteristics")}</h3>
                <Grid minColSize={"200px"} className="gap-4">
                  {manga.type && (
                    <DetailsCard
                      title={t("library:type")}
                      icon={<Icon icon={"lucide:file-type"} className="size-5 text-muted-foreground" />}
                      description={manga.type}
                    />
                  )}
                  {manga.numberOfChapters && (
                    <DetailsCard
                      title={t("library:chapters")}
                      icon={<Icon icon={"lucide:book-open-text"} className="size-5 text-muted-foreground" />}
                      description={manga.numberOfChapters}
                    />
                  )}
                  {manga.numberOfVolumes && (
                    <DetailsCard
                      title={t("library:volumes")}
                      icon={<Icon icon={"lucide:swatch-book"} className="size-5 text-muted-foreground" />}
                      description={manga.numberOfVolumes}
                    />
                  )}
                  {manga.themes.length >= 1 && (
                    <DetailsCard
                      title={t("library:themes")}
                      icon={<Icon icon={"lucide:tree-palm"} className="size-5 text-muted-foreground" />}
                      description={manga.themes.map((theme: string, index: number) => (
                        <span key={theme}>
                          <Link to="/" search={{ landing: "true" }}>
                            {getGenreLabel(t, theme)}
                          </Link>
                          {index < manga.themes.length - 1 && ", "}
                        </span>
                      ))}
                    />
                  )}
                  {manga.authors.length >= 1 && (
                    <DetailsCard
                      title={t("library:authors")}
                      icon={<Icon icon={"lucide:pen"} className="size-5 text-muted-foreground" />}
                      description={manga.authors.map((au: { name: string; malId: number }, index: number) => (
                        <Link to="/" key={au.malId} search={{ landing: "true " }}>
                          {au.name}
                          {index < manga.authors.length - 1 && "; "}
                        </Link>
                      ))}
                    />
                  )}
                  {manga.serializations && (
                    <DetailsCard
                      title={t("library:publisher")}
                      icon={<Icon icon={"lucide:notebook"} className="size-5 text-muted-foreground" />}
                      description={manga.serializations.map((sz: { name: string; malId: number }, index: number) => (
                        <Link to="/" key={sz.malId} search={{ landing: "true" }}>
                          {sz.name}
                          {index < manga.serializations.length - 1 && ", "}
                        </Link>
                      ))}
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
                      <Icon icon={"lucide:bookmark"} className="size-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">5%</p>
                  </div>

                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.reading")}</span>
                      <Icon icon={"lucide:book-open-text"} className="size-5 text-chart-1" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">15%</p>
                  </div>

                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.read")}</span>
                      <Icon icon={"lucide:check-circle"} className="size-5 text-secondary" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">72%</p>
                  </div>

                  <div className="bg-linear-to-br from-muted/50 to-muted p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">{t("feed:lists.dropped")}</span>
                      <Icon icon={"lucide:x-circle"} className="size-5 text-destructive" />
                    </div>
                    <p className="text-2xl font-bold text-card-foreground">8%</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="relations">
              <Relations nodes={[]} edges={[]} />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewItem
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4" />
            </TabsContent>
            <TabsContent value="characters">
              <Grid minColSize={"150px"} className="gap-4">
                {manga.characters?.map((character: { name: string; imageUrl: string }) => {
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

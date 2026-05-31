import { Icon } from "@iconify/react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Grid } from "@/components/layouts/grid.tsx";
import { CommunityStats } from "@/components/pages/details/community-stats";
import { DetailsPageLayout } from "@/components/pages/details/details-page-layout";
import { GenrePills } from "@/components/pages/details/genre-pills";
import { ListItem } from "@/components/pages/details/list";
import { MoreOptionsDialog } from "@/components/pages/details/more-options-dialog";
import { QuickStatusButtons } from "@/components/pages/details/quick-status-buttons";
import { Relations } from "@/components/pages/details/relations";
import { ReviewItem } from "@/components/pages/details/review";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { DetailsCard } from "@/components/shared/cards/details";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { GameModal } from "@/components/shared/modals/game";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";
import { seo } from "@/lib/utils/seo";

const websiteIconMap: Record<string, { icon: string; hex?: string }> = {
  Steam: { icon: "simple-icons:steam" },
  Wikipedia: { icon: "simple-icons:wikipedia" },
  Twitch: { icon: "simple-icons:twitch" },
  Subreddit: { icon: "simple-icons:reddit" },
  Discord: { icon: "simple-icons:discord" },
  Playstation: { icon: "simple-icons:playstation" },
  Xbox: { icon: "fa-brands:xbox" },
  YouTube: { icon: "simple-icons:youtube" },
  Epic: { icon: "simple-icons:epicgames" },
  "Official Website": { icon: "lucide:external-link" },
  Twitter: { icon: "simple-icons:x" },
  Facebook: { icon: "simple-icons:facebook" },
  GOG: { icon: "simple-icons:gogdotcom" },
  Instagram: { icon: "simple-icons:instagram" },
  "Community Wiki": { icon: "lucide:book-search" },
  "App Store (iPhone)": { icon: "simple-icons:appstore" },
  Bluesky: { icon: "simple-icons:bluesky" },
};

export const Route = createFileRoute("/game/$slug")({
  loader: async ({ params }) => {
    const game = await api.get(apiEndpoints.getGameDetails(params.slug)).then(({ data }) => data.game);
    return { game };
  },
  head: ({ loaderData }) => {
    const game = loaderData?.game;
    return {
      meta: [
        ...seo({
          title: game?.name ? game.name : "Game Details",
          description: game?.summary ?? undefined,
          image: game?.coverUrl ?? undefined,
        }),
      ],
    };
  },
  component: GameDetailsRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

const LAYOUT = {
  H_SPACING: 200,
  V_SPACING: 180,
  CENTER: { x: 0, y: 0 },
};

const buildRelationsData = (game: any) => {
  const nodes: any[] = [];
  const edges: any[] = [];
  let nodeId = 0;

  const addNode = (name: string, image: string, link: string, relationship: string, x: number, y: number) => {
    const id = String(nodeId++);
    nodes.push({ id, image, name, link, relationShip: relationship, x, y });
    return id;
  };

  const columnOffset = (items: any[], index: number) => {
    const total = items.length;
    return (index - (total - 1) / 2) * LAYOUT.V_SPACING;
  };

  const mainId = addNode(game.name, game.coverUrl, `/game/${game.id}`, t("library:relationships.now"), 0, 0);

  const leftRelations = [
    ...(game.parentGame?.id ? [{ data: game.parentGame, label: t("library:relationships.parent") }] : []),
    ...(game.prequels?.map((g: any) => ({ data: g, label: t("library:relationships.prequel") })) ?? []),
  ];

  leftRelations.forEach(({ data, label }, i) => {
    const y = columnOffset(leftRelations, i);
    const id = addNode(data.name, data.coverUrl, `/game/${data.id}`, label, -LAYOUT.H_SPACING, y);
    edges.push({ id: `edge-left-${i}`, source: id, target: mainId });
  });

  const rightRelations = [
    ...(game.expandedGames?.map((g: any) => ({ data: g, label: t("library:relationships.expandedGame") })) ?? []),
    ...(game.sequels?.map((g: any) => ({ data: g, label: t("library:relationships.sequel") })) ?? []),
    ...(game.dlcs?.map((g: any) => ({ data: g, label: t("library:relationships.dlc") })) ?? []),
    ...(game.expansions?.map((g: any) => ({ data: g, label: t("library:relationships.expansion") })) ?? []),
    ...(game.ports?.map((g: any) => ({ data: g, label: t("library:relationships.port") })) ?? []),
  ];

  rightRelations.forEach(({ data, label }, i) => {
    const y = columnOffset(rightRelations, i);
    const id = addNode(data.name, data.coverUrl, `/game/${data.id}`, label, LAYOUT.H_SPACING, y);
    edges.push({ id: `edge-right-${i}`, source: mainId, target: id });
  });

  const bottomRelations = [
    ...(game.remakes?.map((g: any) => ({ data: g, label: t("library:relationships.remake") })) ?? []),
    ...(game.remasters?.map((g: any) => ({ data: g, label: t("library:relationships.remaster") })) ?? []),
  ];

  bottomRelations.forEach(({ data, label }, i) => {
    const x = columnOffset(bottomRelations, i);
    const id = addNode(data.name, data.coverUrl, `/game/${data.id}`, label, x, LAYOUT.V_SPACING * 2);
    edges.push({ id: `edge-bottom-${i}`, source: id, target: mainId });
  });

  const bundles = game.bundles ?? [];
  bundles.forEach((data: any, i: number) => {
    const x = columnOffset(bundles, i);
    const id = addNode(
      data.name,
      data.coverUrl,
      `/game/${data.id}`,
      t("library:relationships.bundle"),
      x,
      -LAYOUT.V_SPACING * 2,
    );
    edges.push({ id: `edge-top-${i}`, source: mainId, target: id });
  });

  return { nodes, edges };
};

function GameDetailsRoute() {
  const { slug } = Route.useParams();
  const { game: loaderGame } = Route.useLoaderData();

  const rating = 4.2;
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["game", slug],
    queryFn: () => api.get(apiEndpoints.getGameDetails(slug)).then(({ data }) => data.game),
    initialData: loaderGame,
  });
  const game = data;

  const [reviewsQuery, screenshotsQuery] = useQueries({
    queries: [
      {
        queryKey: ["gameReviews", game?.id],
        queryFn: () => api.get(`${apiEndpoints.gameReview}/?gameId=${game?.id}`).then(({ data }) => data.gameReviews),
        enabled: !!game?.id,
      },
      {
        queryKey: ["gameScreenshots", game?.id],
        queryFn: () =>
          api.get(`${apiEndpoints.gameReviewScreenshot}/?gameId=${game?.id}`).then(({ data }) => data.screenshots),
        enabled: !!game?.id,
      },
    ],
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return api.post(apiEndpoints.refreshGameData, { igdbId: Number(slug) });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["game", slug] });
    },
    onError: () => {
      return toast.error(t("api:GAME_ALREADY_REFRESHED"));
    },
  });

  const reviews = reviewsQuery.data;
  const screenshots = screenshotsQuery.data;

  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  if (isLoading || reviewsQuery.isLoading) return <LoadingDetails />;
  if (isError || reviewsQuery.isError || !game) return <ErrorComponent />;

  const coverUrl = game.coverUrl || "/placeholder/cover.webp";
  const releaseDate = new Date(game.firstReleaseDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sidebar = (
    <>
      <div className="mb-2 w-full h-auto mx-auto shadow-xl rounded-lg overflow-hidden">
        <img src={coverUrl} alt="Capa do jogo" className="w-full h-auto object-cover" />
      </div>
      {isAuthenticated && (
        <>
          <QuickStatusButtons
            buttons={[
              {
                label: t("feed:lists.wanttoplay"),
                icon: "lucide:bookmark",
                hoverBorder: "hover:border-purple-400",
                hoverBg: "hover:bg-purple-400/20",
                iconBg: "bg-linear-to-r from-purple-500/20 to-violet-500/20",
                iconBorder: "border-purple-500/30",
                iconColor: "text-purple-400",
              },
              {
                label: t("feed:lists.playing"),
                icon: "lucide:gamepad",
                hoverBorder: "hover:border-primary",
                hoverBg: "hover:bg-primary/20",
                iconBg: "bg-linear-to-r from-primary/20 to-secondary/20",
                iconBorder: "border-primary/30",
                iconColor: "text-primary",
              },
              {
                label: t("feed:lists.played"),
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
            title={game.name}
            coverUrl={coverUrl}
            rating={rating}
            subtitle={releaseDate}
            description={game.summary}
            triggerLabel={t("library:moreOptions")}
          >
            <GameModal />
          </MoreOptionsDialog>
        </>
      )}

      <div className="border-t border-border" />

      <Grid className="gap-4" minColSize={"128px"}>
        {game.status && (
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">{t("library:status")}</p>
            <p className="font-semibold text-card-foreground">Early Access</p>
          </div>
        )}
        <div className="bg-muted/50 p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">{t("library:releaseDate")}</p>
          <p className="font-semibold text-card-foreground">{releaseDate}</p>
        </div>
      </Grid>
      <RefreshData sourceURL={`https://www.igdb.com/games/${game.slug}`} onSubmit={() => mutation.mutate()} />
      <div className="flex flex-wrap gap-3 items-center justify-center">
        {game.websites?.map((website: { name: string; url: string }, idx: number) => {
          const iconData = websiteIconMap[website.name];
          if (!iconData) return null;
          return (
            <a key={idx} href={website.url} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              <Icon icon={iconData.icon} />
            </a>
          );
        })}
      </div>
    </>
  );

  return (
    <DetailsPageLayout sidebar={sidebar}>
      <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
        {game.name}
      </h1>
      {game?.franchises[0]?.name && (
        <div className="flex items-center space-x-2">
          <Icon icon={"lucide:box"} className="size-5 text-muted-foreground" />
          <Link
            to={"/game/franchises/$slug"}
            params={{ slug: game?.franchises[0]?.slug }}
            className="text-xl text-muted-foreground"
          >
            {game?.franchises[0]?.name}
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-6 border-b border-border">
        {reviews?.total >= 1 && (
          <div className="flex items-center mb-5">
            <div className="flex mr-2">
              <Icon icon={"lucide:star"} className="size-5 text-chart-3 fill-chart-3" />
              <Icon icon={"lucide:star"} className="size-5 text-chart-3 fill-chart-3" />
              <Icon icon={"lucide:star"} className="size-5 text-chart-3 fill-chart-3" />
              <Icon icon={"lucide:star"} className="size-5 text-chart-3 fill-chart-3" />
              <Icon icon={"lucide:star"} className="size-5 text-muted-foreground" />
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
            {(game.parentGame?.id ||
              (game.prequels?.length ?? 0) > 0 ||
              (game.expandedGames?.length ?? 0) > 0 ||
              (game.sequels?.length ?? 0) > 0 ||
              (game.dlcs?.length ?? 0) > 0 ||
              (game.expansions?.length ?? 0) > 0 ||
              (game.ports?.length ?? 0) > 0 ||
              (game.remakes?.length ?? 0) > 0 ||
              (game.remasters?.length ?? 0) > 0 ||
              (game.bundles?.length ?? 0) > 0) && <TabsTrigger value="relations">{t("library:relations")}</TabsTrigger>}
            {reviews?.total >= 1 && (
              <TabsTrigger value="reviews" className="capitalize">
                {t("library:reviews")} ({reviews?.total})
              </TabsTrigger>
            )}
            <TabsTrigger value="lists">{t("library:lists")} (30)</TabsTrigger>
            {!screenshotsQuery.isLoading && !screenshotsQuery.isError && (
              <TabsTrigger value="screenshots">
                {t("library:screenshots")} ({screenshots?.length ?? 0})
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        <TabsContent value="info" className={"space-y-5"}>
          <div>
            <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:genres")}</h3>
            <GenrePills
              genres={game.genres.map((g: { name: string }) => g.name)}
              getLabel={(g) => getGenreLabel(t, g)}
            />
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:synopsis")}</h3>
            <div className="text-muted-foreground leading-relaxed space-y-4">
              <p>{game.summary}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:gameCharacteristics")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <DetailsCard
                title={t("library:developers")}
                icon={<Icon icon={"lucide:code"} className="size-5 text-muted-foreground" />}
                description={game.involvedCompanies
                  .filter((c: { developer: string }) => c.developer)
                  .map((c: { companyName: string }) => c.companyName)
                  .join(", ")}
              />
              <DetailsCard
                title={t("library:publishers")}
                icon={<Icon icon={"lucide:building-2"} className="size-5 text-muted-foreground" />}
                description={game.involvedCompanies
                  .filter((c: { publisher: string }) => c.publisher)
                  .map((c: { companyName: string }) => c.companyName)
                  .join(", ")}
              />
              <DetailsCard
                title={t("library:platforms")}
                icon={<Icon icon={"lucide:computer"} className="size-5 text-muted-foreground" />}
                description={game.platforms.map((p: { name: string }) => p.name).join(", ")}
              />
              <DetailsCard
                title={t("library:themes")}
                icon={<Icon icon={"lucide:tree-deciduous"} className="size-5 text-muted-foreground" />}
                description={game.themes.join(", ")}
              />
              <DetailsCard
                title={t("library:gameModes")}
                icon={<Icon icon={"lucide:ethernet-port"} className="size-5 text-muted-foreground" />}
                description={game.gameModes.map((m: { name: string }) => m.name).join(", ")}
              />
              <DetailsCard
                title={t("library:playerPerspectives")}
                icon={<Icon icon={"lucide:cctv"} className="size-5 text-muted-foreground" />}
                description={game.playerPerspectives.map((p: { name: string }) => p.name).join(", ")}
              />
              {game.gameEngines.length > 0 && (
                <DetailsCard
                  title={t("library:gameEngine")}
                  icon={<Icon icon={"lucide:bug"} className="size-5 text-muted-foreground" />}
                  description={game.gameEngines.map((e: { name: string }) => e.name).join(", ")}
                />
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:communityStatistics")}</h3>
            <CommunityStats
              stats={[
                {
                  label: t("feed:lists.wanttoplay"),
                  icon: "lucide:bookmark",
                  iconClass: "text-purple-400",
                  value: "5%",
                },
                { label: t("feed:lists.playing"), icon: "lucide:gamepad", iconClass: "text-chart-1", value: "15%" },
                {
                  label: t("feed:lists.played"),
                  icon: "lucide:check-circle",
                  iconClass: "text-secondary",
                  value: "72%",
                },
                { label: t("feed:lists.dropped"), icon: "lucide:x-circle", iconClass: "text-destructive", value: "8%" },
              ]}
            />
          </div>
          <Carousel className="w-full px-4" opts={{ loop: true, align: "center" }}>
            <CarouselContent>
              {game.videos.map((video: { checksum: string; videoId: string; name: string }) => (
                <CarouselItem key={video.checksum}>
                  <iframe src={video.videoId} allowFullScreen className="w-full aspect-video" title={video.name} />
                </CarouselItem>
              ))}
              {game.screenshots.map((screenshot: { checksum: string; imageId: string }) => (
                <CarouselItem key={screenshot.checksum}>
                  <img src={screenshot.imageId} className="w-full aspect-video object-cover" alt="Screenshot" />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious variant="default" className="-left-6" />
            <CarouselNext variant="default" className="-right-6" />
          </Carousel>
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
        <TabsContent value="relations">
          {(() => {
            const { nodes, edges } = buildRelationsData(game);
            return <Relations nodes={nodes} edges={edges} />;
          })()}
        </TabsContent>
        {!screenshotsQuery.isLoading && !screenshotsQuery.isError && (
          <TabsContent value="screenshots">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {screenshots?.map((screenshot: { checksum: string; imageId: string }) => (
                <ImageZoom key={screenshot.checksum}>
                  <img src={screenshot.imageId} alt="" />
                </ImageZoom>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </DetailsPageLayout>
  );
}

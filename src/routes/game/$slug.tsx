import { Icon } from "@iconify/react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { t } from "i18next";
import { useState } from "react";
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
import { ReviewItem } from "@/components/pages/details/review-item";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { DetailsCard } from "@/components/shared/cards/details";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { GameModal } from "@/components/shared/modals/game";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { StarRating } from "@/components/shared/star-rating.tsx";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { gameScreenshotsQueryKey } from "@/hooks/game";
import { useToggleReviewReaction } from "@/hooks/review";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";
import { mediaJsonLd } from "@/lib/utils/json-ld";
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
      scripts: [
        mediaJsonLd({
          type: "VideoGame",
          name: game?.name,
          description: game?.summary ?? undefined,
          image: game?.coverUrl ?? undefined,
          rating: game?.tgReviewScore ?? undefined,
          extra: {
            applicationCategory: "Game",
            genre: game?.genres?.map((g: { name: string }) => g.name),
            gamePlatform: game?.platforms?.map((p: { name: string }) => p.name),
            datePublished: game?.firstReleaseDate
              ? new Date(game.firstReleaseDate).toISOString()
              : undefined,
          },
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

type ProgressStatus = "Planning" | "Playing" | "Completed";

interface GameProgress {
  id: string;
  status: string;
  gameId: string;
  userId: string;
}

type RelatedGame = { id: string; name: string; coverUrl: string };

type GameRelations = {
  id: string;
  name: string;
  coverUrl: string;
  parentGame?: RelatedGame | null;
  prequels?: RelatedGame[];
  expandedGames?: RelatedGame[];
  sequels?: RelatedGame[];
  dlcs?: RelatedGame[];
  expansions?: RelatedGame[];
  ports?: RelatedGame[];
  remakes?: RelatedGame[];
  remasters?: RelatedGame[];
  bundles?: RelatedGame[];
};

type FlowNode = { id: string; image: string; name: string; link: string; relationShip: string; x: number; y: number };
type FlowEdge = { id: string; source: string; target: string };

const buildRelationsData = (game: GameRelations) => {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  let nodeId = 0;

  const addNode = (name: string, image: string, link: string, relationship: string, x: number, y: number) => {
    const id = String(nodeId++);
    nodes.push({ id, image, name, link, relationShip: relationship, x, y });
    return id;
  };

  const columnOffset = (items: unknown[], index: number) => {
    const total = items.length;
    return (index - (total - 1) / 2) * LAYOUT.V_SPACING;
  };

  const mainId = addNode(game.name, game.coverUrl, `/game/${game.id}`, t("library:relationships.now"), 0, 0);

  const leftRelations = [
    ...(game.parentGame?.id ? [{ data: game.parentGame, label: t("library:relationships.parent") }] : []),
    ...(game.prequels?.map((g) => ({ data: g, label: t("library:relationships.prequel") })) ?? []),
  ];

  leftRelations.forEach(({ data, label }, i) => {
    const y = columnOffset(leftRelations, i);
    const id = addNode(data.name, data.coverUrl, `/game/${data.id}`, label, -LAYOUT.H_SPACING, y);
    edges.push({ id: `edge-left-${i}`, source: id, target: mainId });
  });

  const rightRelations = [
    ...(game.expandedGames?.map((g) => ({ data: g, label: t("library:relationships.expandedGame") })) ?? []),
    ...(game.sequels?.map((g) => ({ data: g, label: t("library:relationships.sequel") })) ?? []),
    ...(game.dlcs?.map((g) => ({ data: g, label: t("library:relationships.dlc") })) ?? []),
    ...(game.expansions?.map((g) => ({ data: g, label: t("library:relationships.expansion") })) ?? []),
    ...(game.ports?.map((g) => ({ data: g, label: t("library:relationships.port") })) ?? []),
  ];

  rightRelations.forEach(({ data, label }, i) => {
    const y = columnOffset(rightRelations, i);
    const id = addNode(data.name, data.coverUrl, `/game/${data.id}`, label, LAYOUT.H_SPACING, y);
    edges.push({ id: `edge-right-${i}`, source: mainId, target: id });
  });

  const bottomRelations = [
    ...(game.remakes?.map((g) => ({ data: g, label: t("library:relationships.remake") })) ?? []),
    ...(game.remasters?.map((g) => ({ data: g, label: t("library:relationships.remaster") })) ?? []),
  ];

  bottomRelations.forEach(({ data, label }, i) => {
    const x = columnOffset(bottomRelations, i);
    const id = addNode(data.name, data.coverUrl, `/game/${data.id}`, label, x, LAYOUT.V_SPACING * 2);
    edges.push({ id: `edge-bottom-${i}`, source: id, target: mainId });
  });

  const bundles = game.bundles ?? [];
  bundles.forEach((data, i) => {
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

function ListWithMore({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="truncate">{items[0]}</span>
      {items.length > 1 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="shrink-0 cursor-default rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
              +{items.length - 1}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <ul className="flex flex-col gap-0.5">
              {items.slice(1).map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}

function GameDetailsRoute() {
  const { slug } = Route.useParams();
  const { game: loaderGame } = Route.useLoaderData();

  const { t } = useTranslation();
  const [moreOpen, setMoreOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["game", slug],
    queryFn: () => api.get(apiEndpoints.getGameDetails(slug)).then(({ data }) => data.game),
    initialData: loaderGame,
  });
  const game = data;

  const rating = game?.tgReviewScore ?? 0;

  const [reviewsQuery, screenshotsQuery] = useQueries({
    queries: [
      {
        queryKey: ["gameReviews", game?.id],
        queryFn: () => api.get(`${apiEndpoints.gameReview}/?gameId=${game?.id}`).then(({ data }) => data.gameReviews),
        enabled: !!game?.id,
      },
      {
        queryKey: gameScreenshotsQueryKey({ gameId: game?.id }),
        queryFn: () =>
          api
            .get<ApiTypes.GetGameScreenshotsResponse>(`${apiEndpoints.gameScreenshot}/`, {
              params: { gameId: game?.id },
            })
            .then(({ data }) => data.screenshots),
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
  const userId = session?.data?.user?.id;
  const [newListName, setNewListName] = useState("");

  const listsQuery = useQuery<ApiTypes.PaginatedResponse<ApiTypes.ListWithPreview>>({
    queryKey: ["gameContainingLists", game?.id],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsContainingItemResponse>(apiEndpoints.getListsContainingItem, {
          params: { type: "Game", gameId: game?.id, itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists),
    enabled: !!game?.id,
  });

  const userListsQuery = useQuery<ApiTypes.List[]>({
    queryKey: ["gameLists", userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Game", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items),
    enabled: isAuthenticated && !!userId,
  });

  const listStatusQuery = useQuery<string[]>({
    queryKey: ["gameListStatus", game?.id, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListStatusResponse>(apiEndpoints.getListStatus, {
          params: { type: "Game", gameId: game?.id },
        })
        .then(({ data }) => data.listIds),
    enabled: isAuthenticated && !!userId && !!game?.id,
  });

  const toggleListMutation = useMutation({
    mutationFn: ({ listId, isMember }: { listId: string; isMember: boolean }) => {
      const body = { type: "Game", listId, userId, gameId: game?.id };
      return isMember
        ? api.delete(apiEndpoints.listItem(listId), { data: body })
        : api.post(apiEndpoints.listItem(listId), body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameListStatus", game?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["gameContainingLists", game?.id] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const createAndAddListMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post(apiEndpoints.list, { name, userId, type: "Game" });
      const freshLists = await api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Game", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items);
      const newList = [...freshLists].reverse().find((l) => l.name === name);
      if (!newList) throw new Error("List not found after creation");
      await api.post(apiEndpoints.listItem(newList.id), { type: "Game", listId: newList.id, userId, gameId: game?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameLists", userId] });
      queryClient.invalidateQueries({ queryKey: ["gameListStatus", game?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["gameContainingLists", game?.id] });
      setNewListName("");
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const toggleReaction = useToggleReviewReaction("game", userId ?? "");

  const progressQuery = useQuery<GameProgress | null>({
    queryKey: ["gameProgress", game?.id, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.getGameProgress(userId as string, game?.id as string))
        .then(({ data }) => data.gameProgresses.items[0] ?? null),
    enabled: isAuthenticated && !!userId && !!game?.id,
  });

  const currentStatus = progressQuery.data?.status;

  const setProgressMutation = useMutation({
    mutationFn: (status: ProgressStatus) => {
      const current = progressQuery.data;

      if (current && current.status === status) {
        return api.delete(`${apiEndpoints.gameProgress}/${current.id}`);
      }

      return api.post(apiEndpoints.gameProgress, { gameId: game?.id, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameProgress", game?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["game", slug] });
    },
    onError: () => {
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  const favoriteQuery = useQuery<boolean>({
    queryKey: ["gameFavorite", game?.id, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetFavoriteStatusResponse>(apiEndpoints.getFavoriteStatus, {
          params: { type: "Game", gameId: game?.id },
        })
        .then(({ data }) => data.favorited),
    enabled: isAuthenticated && !!userId && !!game?.id,
  });

  const isFavorited = !!favoriteQuery.data;

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => {
      const body = { type: "Game", gameId: game?.id };

      return isFavorited
        ? api.delete(apiEndpoints.removeFavorite, { data: body })
        : api.post(apiEndpoints.addFavorite, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameFavorite", game?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["gameFavorite", game?.id, userId] });
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  if (isLoading || reviewsQuery.isLoading) return <LoadingDetails />;
  if (isError || reviewsQuery.isError || !game) return <ErrorComponent />;

  const coverUrl = game.coverUrl || "/placeholder/cover.webp";
  const releaseDate = new Date(game.firstReleaseDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const developers = game.involvedCompanies
    .filter((c: { developer: string }) => c.developer)
    .map((c: { companyName: string }) => c.companyName);
  const publishers = game.involvedCompanies
    .filter((c: { publisher: string }) => c.publisher)
    .map((c: { companyName: string }) => c.companyName);
  const platformNames = game.platforms
    .map((p: { name: string }) => p.name)
    .sort((a: string, b: string) => {
      if (a === "PC (Microsoft Windows)") return -1;
      if (b === "PC (Microsoft Windows)") return 1;
      return 0;
    });
  const themes: string[] = game.themes;
  const gameModes = game.gameModes.map((m: { name: string }) => m.name);
  const playerPerspectives = game.playerPerspectives.map((p: { name: string }) => p.name);
  const hasScreenshots = (screenshots?.total ?? 0) > 0;

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
                activeClass: "border-purple-400 bg-purple-400/20",
                isActive: currentStatus === "Planning",
                disabled: setProgressMutation.isPending,
                onClick: () => setProgressMutation.mutate("Planning"),
              },
              {
                label: t("feed:lists.playing"),
                icon: "lucide:gamepad",
                hoverBorder: "hover:border-primary",
                hoverBg: "hover:bg-primary/20",
                iconBg: "bg-linear-to-r from-primary/20 to-secondary/20",
                iconBorder: "border-primary/30",
                iconColor: "text-primary",
                activeClass: "border-primary bg-primary/20",
                isActive: currentStatus === "Playing",
                disabled: setProgressMutation.isPending,
                onClick: () => setProgressMutation.mutate("Playing"),
              },
              {
                label: t("feed:lists.played"),
                icon: "lucide:check-square",
                hoverBorder: "hover:border-chart-3",
                hoverBg: "hover:bg-chart-3/20",
                iconBg: "bg-linear-to-r from-chart-3/20 to-amber-500/20",
                iconBorder: "border-chart-3/30",
                iconColor: "text-chart-3",
                activeClass: "border-chart-3 bg-chart-3/20",
                isActive: currentStatus === "Completed",
                disabled: setProgressMutation.isPending,
                onClick: () => setProgressMutation.mutate("Completed"),
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
            open={moreOpen}
            onOpenChange={setMoreOpen}
            isFavorited={isFavorited}
            onToggleFavorite={() => toggleFavoriteMutation.mutate()}
            favoriteDisabled={toggleFavoriteMutation.isPending || favoriteQuery.isFetching}
          >
            <GameModal gameId={game.id} onClose={() => setMoreOpen(false)} />
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
      {isAuthenticated && (
        <RefreshData sourceURL={`https://www.igdb.com/games/${game.slug}`} onSubmit={() => mutation.mutate()} />
      )}
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
    <>
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
          <div className="flex items-center mb-3 space-x-1">
            <StarRating value={rating} className="mr-1" />
            <span className="font-semibold text-card-foreground">{rating}</span>
            <span className="text-muted-foreground">
              ({reviews?.total ?? 0} {t("library:reviews")})
            </span>
          </div>
        </div>
        <Tabs defaultValue="info">
          <div className="flex items-center justify-between gap-3 mb-2">
            <TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
              <TabsTrigger value="info">{t("library:info")}</TabsTrigger>
              <TabsTrigger value="lists">
                {t("library:lists")} ({listsQuery.data?.total ?? 0})
              </TabsTrigger>
              {hasScreenshots && (
                <TabsTrigger value="screenshots">
                  {t("common:screenshots")} ({screenshots?.total ?? 0})
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          <TabsContent value="info" className={"space-y-5"}>
            <div className={"space-y-3"}>
              <p className="text-muted-foreground leading-relaxed">{game.summary}</p>
              <h3 className="font-semibold text-card-foreground text-lg">{t("library:genres")}</h3>
              <GenrePills
                genres={game.genres.map((g: { name: string }) => g.name)}
                getLabel={(g) => getGenreLabel(t, g)}
              />
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:gameCharacteristics")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {developers.length > 0 && (
                  <DetailsCard
                    title={t("library:developers")}
                    icon={<Icon icon={"lucide:code"} className="size-5 text-muted-foreground" />}
                    description={<ListWithMore items={developers} />}
                  />
                )}
                {publishers.length > 0 && (
                  <DetailsCard
                    title={t("library:publishers")}
                    icon={<Icon icon={"lucide:building-2"} className="size-5 text-muted-foreground" />}
                    description={<ListWithMore items={publishers} />}
                  />
                )}
                {platformNames.length > 0 && (
                  <DetailsCard
                    title={t("library:platforms")}
                    icon={<Icon icon={"lucide:computer"} className="size-5 text-muted-foreground" />}
                    description={<ListWithMore items={platformNames} />}
                  />
                )}
                {themes.length > 0 && (
                  <DetailsCard
                    title={t("library:themes")}
                    icon={<Icon icon={"lucide:tree-deciduous"} className="size-5 text-muted-foreground" />}
                    description={<ListWithMore items={themes} />}
                  />
                )}
                {gameModes.length > 0 && (
                  <DetailsCard
                    title={t("library:gameModes")}
                    icon={<Icon icon={"lucide:ethernet-port"} className="size-5 text-muted-foreground" />}
                    description={<ListWithMore items={gameModes} />}
                  />
                )}
                {playerPerspectives.length > 0 && (
                  <DetailsCard
                    title={t("library:playerPerspectives")}
                    icon={<Icon icon={"lucide:cctv"} className="size-5 text-muted-foreground" />}
                    description={<ListWithMore items={playerPerspectives} />}
                  />
                )}
                {game.gameEngines.length > 0 && (
                  <DetailsCard
                    title={t("library:gameEngine")}
                    icon={<Icon icon={"lucide:bug"} className="size-5 text-muted-foreground" />}
                    description={game.gameEngines.map((e: { name: string }) => e.name).join(", ")}
                  />
                )}
              </div>
            </div>

            {(() => {
              const { nodes, edges } = buildRelationsData(game);
              if (edges.length === 0) return null;
              return (
                <div>
                  <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:relations")}</h3>
                  <Relations nodes={nodes} edges={edges} />
                </div>
              );
            })()}

            <div>
              <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:communityStatistics")}</h3>
              <CommunityStats
                stats={[
                  {
                    label: t("feed:lists.wanttoplay"),
                    icon: "lucide:bookmark",
                    iconClass: "text-purple-400",
                    value: `${game.progressStats?.planToPlay?.percentage ?? 0}%`,
                  },
                  {
                    label: t("feed:lists.playing"),
                    icon: "lucide:gamepad",
                    iconClass: "text-chart-1",
                    value: `${game.progressStats?.playing?.percentage ?? 0}%`,
                  },
                  {
                    label: t("feed:lists.played"),
                    icon: "lucide:check-circle",
                    iconClass: "text-secondary",
                    value: `${game.progressStats?.completed?.percentage ?? 0}%`,
                  },
                  {
                    label: t("feed:lists.dropped"),
                    icon: "lucide:x-circle",
                    iconClass: "text-destructive",
                    value: `${game.progressStats?.dropped?.percentage ?? 0}%`,
                  },
                ]}
              />
            </div>
            <Carousel className="w-full" opts={{ loop: true, align: "center" }}>
              <CarouselContent>
                {game.videos.map((video: { checksum: string; videoId: string; name: string }) => (
                  <CarouselItem key={video.checksum}>
                    <div className="relative w-full overflow-hidden pt-[56.25%]">
                      <iframe
                        src={video.videoId}
                        allowFullScreen
                        className="w-full inset-0 absolute h-full"
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                        title={video.name}
                      />
                    </div>
                  </CarouselItem>
                ))}
                {game.screenshots.map((screenshot: { checksum: string; imageId: string }) => (
                  <CarouselItem key={screenshot.checksum}>
                    <div className="relative w-full overflow-hidden pt-[56.25%]">
                      <div
                        className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
                        style={{ backgroundImage: `url(${screenshot.imageId})` }}
                        aria-hidden="true"
                      />
                      <ImageZoom className="absolute inset-0">
                        <Image
                          src={screenshot.imageId}
                          width={1920}
                          height={1080}
                          alt="Screenshot"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </ImageZoom>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious variant="default" className="left-2" />
              <CarouselNext variant="default" className="right-2" />
            </Carousel>
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
          {hasScreenshots && (
            <TabsContent value="screenshots">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {screenshots?.items.map((screenshot) => (
                  <UserScreenshot key={screenshot.id} screenshot={screenshot} />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DetailsPageLayout>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-card-foreground text-lg capitalize">
            {t("library:reviews")} ({reviews?.total ?? 0})
          </h3>
          {isAuthenticated && (
            <Button variant="outline" size="sm" className="shrink-0 gap-2" onClick={() => setMoreOpen(true)}>
              <Icon icon="lucide:pen-line" className="size-4" />
              {t("feed:review")}
            </Button>
          )}
        </div>
        {(reviews?.items?.length ?? 0) === 0 ? (
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
                date={new Date(review.createdAt)}
                criteries={{
                  all: Number(review.overall),
                  graphics: review.graphics != null ? Number(review.graphics) : undefined,
                  soundtrack: review.sound != null ? Number(review.sound) : undefined,
                  story: review.story != null ? Number(review.story) : undefined,
                  gameplay: review.gameplay != null ? Number(review.gameplay) : undefined,
                }}
                reviewId={review.id}
                reactions={review.reactions}
                onReact={(emoji, currentReaction) =>
                  toggleReaction.mutate(
                    { reviewId: review.id, currentReaction, emoji },
                    { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gameReviews", game.id] }) },
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

function UserScreenshot({ screenshot }: { screenshot: ApiTypes.GameScreenshot }) {
  const [revealed, setRevealed] = useState(!screenshot.isSpoiler);

  if (!revealed) {
    return (
      <button
        type="button"
        className="relative rounded-lg overflow-hidden"
        onClick={() => setRevealed(true)}
        aria-label={t("comments:spoilerReveal")}
      >
        <img src={screenshot.url} alt="" className="blur-xl" />
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium text-white bg-black/40">
          <Icon icon="lucide:eye-off" className="size-4" />
          {t("comments:spoilerReveal")}
        </span>
      </button>
    );
  }

  return (
    <figure>
      <ImageZoom>
        <img src={screenshot.url} alt={screenshot.description ?? ""} />
      </ImageZoom>
      {screenshot.description && (
        <figcaption className="text-sm text-muted-foreground mt-1">{screenshot.description}</figcaption>
      )}
    </figure>
  );
}

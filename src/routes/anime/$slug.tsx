import { Icon } from "@iconify/react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Grid } from "@/components/layouts/grid.tsx";
import { AnimeEpisodeProgress, type SingleSeasonData } from "@/components/pages/details/anime-progress";
import { BackfillEpisodesDialog } from "@/components/pages/details/backfill-episodes-dialog";
import { CastItem } from "@/components/pages/details/cast";
import { CharacterItem } from "@/components/pages/details/character";
import { CommunityStats } from "@/components/pages/details/community-stats";
import { DetailsPageLayout } from "@/components/pages/details/details-page-layout";
import { EpisodeItem } from "@/components/pages/details/episode";
import { GenrePills } from "@/components/pages/details/genre-pills";
import { ListItem } from "@/components/pages/details/list";
import { MoreOptionsDialog } from "@/components/pages/details/more-options-dialog";
import { QuickStatusButtons } from "@/components/pages/details/quick-status-buttons";
import { Relations } from "@/components/pages/details/relations";
import { ReviewItem } from "@/components/pages/details/review-item";
import { DetailsCard } from "@/components/shared/cards/details";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { EpisodicContentModal } from "@/components/shared/modals/episodic-content";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { StarRating } from "@/components/shared/star-rating.tsx";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { REVIEW_CONTENT, useToggleReviewReaction } from "@/hooks/review";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth/client";
import { ogUrl } from "@/lib/og/url";
import { cn } from "@/lib/utils";
import {
  getBackfillPreference,
  getUnwatchedPreviousEpisodes,
  setBackfillPreference,
} from "@/lib/utils/episode-backfill";
import { getGenreLabel } from "@/lib/utils/genre-utils";
import { mediaJsonLd } from "@/lib/utils/json-ld";
import { seo } from "@/lib/utils/seo";

interface AnimeEpisode {
  malId: number;
  title: string;
  episodeNumber: string;
  imageUrl: string | null;
}

export const Route = createFileRoute("/anime/$slug")({
  loader: async ({ params }) => {
    const anime = await api.get(apiEndpoints.getAnimeDetails(params.slug)).then(({ data }) => data.anime);
    return { anime };
  },
  head: ({ params, loaderData }) => {
    const anime = loaderData?.anime;
    return {
      meta: [
        ...seo({
          title: anime?.title ? anime.title : "Anime Details",
          description: anime?.synopsis ?? undefined,
          image: ogUrl.media("anime", params.slug),
        }),
      ],
      scripts: [
        mediaJsonLd({
          type: "CreativeWork",
          name: anime?.title,
          description: anime?.synopsis ?? undefined,
          image: anime?.imageUrl ?? undefined,
          rating: anime?.tgReviewScore ?? undefined,
          extra: {
            genre: anime?.genres,
          },
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
  const [moreOpen, setMoreOpen] = useState(false);

  const {
    data: anime,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["anime", slug],
    queryFn: () => api.get(apiEndpoints.getAnimeDetails(slug)).then(({ data }) => data.anime),
    initialData: loaderAnime,
  });

  const rating = anime?.tgReviewScore ?? 0;

  const episodesQuery = useInfiniteQuery({
    queryKey: ["animeEpisodes", slug],
    queryFn: ({ pageParam }) =>
      api
        .get(apiEndpoints.getAnimeEpisodeDetails(slug), { params: { page: pageParam } })
        .then(({ data }) => data.episodes),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
    enabled: !!anime,
  });

  const reviewsQuery = useQuery({
    queryKey: ["animeReviews", anime?.id],
    queryFn: () => api.get(`${apiEndpoints.animeReview}/?animeId=${anime?.id}`).then(({ data }) => data.animeReviews),
    enabled: !!anime?.id,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return api.post(apiEndpoints.refreshAnimeData, { malId: Number(slug) });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["anime", slug] });
    },
    onError: () => {
      return toast.error(t("api:ANIME_ALREADY_REFRESHED"));
    },
  });

  const episodes = useMemo<AnimeEpisode[]>(
    () => (episodesQuery.data?.pages ?? []).flatMap((page) => page.items ?? []),
    [episodesQuery.data],
  );
  const reviews = reviewsQuery.data;

  const [episodesSentinel, setEpisodesSentinel] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!episodesSentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && episodesQuery.hasNextPage && !episodesQuery.isFetchingNextPage) {
          episodesQuery.fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(episodesSentinel);
    return () => observer.disconnect();
  }, [episodesSentinel, episodesQuery.hasNextPage, episodesQuery.isFetchingNextPage, episodesQuery.fetchNextPage]);

  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  const userId = session?.data?.user?.id;
  const [newListName, setNewListName] = useState("");

  const listsQuery = useQuery<ApiTypes.PaginatedResponse<ApiTypes.ListWithPreview>>({
    queryKey: ["animeContainingLists", anime?.id],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsContainingItemResponse>(apiEndpoints.getListsContainingItem, {
          params: { type: "Anime", animeId: anime?.id, itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists),
    enabled: !!anime?.id,
  });

  const userListsQuery = useQuery<ApiTypes.List[]>({
    queryKey: ["animeLists", userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Anime", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items),
    enabled: isAuthenticated && !!userId,
  });

  const listStatusQuery = useQuery<string[]>({
    queryKey: ["animeListStatus", anime?.id, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListStatusResponse>(apiEndpoints.getListStatus, {
          params: { type: "Anime", animeId: anime?.id },
        })
        .then(({ data }) => data.listIds),
    enabled: isAuthenticated && !!userId && !!anime?.id,
  });

  const toggleListMutation = useMutation({
    mutationFn: ({ listId, isMember }: { listId: string; isMember: boolean }) => {
      const body = { type: "Anime", listId, userId, animeId: anime?.id };
      return isMember
        ? api.delete(apiEndpoints.listItem(listId), { data: body })
        : api.post(apiEndpoints.listItem(listId), body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animeListStatus", anime?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["animeContainingLists", anime?.id] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const createAndAddListMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post(apiEndpoints.list, { name, userId, type: "Anime" });
      const freshLists = await api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Anime", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items);
      const newList = [...freshLists].reverse().find((l) => l.name === name);
      if (!newList) throw new Error("List not found after creation");
      await api.post(apiEndpoints.listItem(newList.id), {
        type: "Anime",
        listId: newList.id,
        userId,
        animeId: anime?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animeLists", userId] });
      queryClient.invalidateQueries({ queryKey: ["animeListStatus", anime?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["animeContainingLists", anime?.id] });
      setNewListName("");
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const toggleReaction = useToggleReviewReaction("anime", userId ?? "");

  const progressQuery = useQuery<AnimeProgress | null>({
    queryKey: ["animeProgress", anime?.id, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.getAnimeProgress(userId as string, anime?.id as string))
        .then(({ data }) => data.animeProgresses.items[0] ?? null),
    enabled: isAuthenticated && !!userId && !!anime?.id,
  });

  const currentStatus = progressQuery.data?.status;

  const setProgressMutation = useMutation({
    mutationFn: (status: AnimeProgressStatus) => {
      const current = progressQuery.data;

      if (current && current.status === status) {
        return api.delete(`${apiEndpoints.animeProgress}/${current.id}`);
      }

      return api.post(apiEndpoints.animeProgress, {
        animeId: anime?.id,
        status,
        ...(status === "Watching" && { startedAt: new Date() }),
        ...(status === "Completed" && { completedAt: new Date() }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animeProgress", anime?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["animeEpisodeWatch", anime?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["anime", slug] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const episodeWatchQuery = useQuery<AnimeEpisodeWatch[]>({
    queryKey: ["animeEpisodeWatch", anime?.id, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.getAnimeEpisodeWatch(userId as string, anime?.id as string))
        .then(({ data }) => data.animeEpisodeWatch),
    enabled: isAuthenticated && !!userId && !!anime?.id,
  });

  const watchedEpisodeNumbers = (episodeWatchQuery.data ?? [])
    .filter((watch) => watch.status === "Completed")
    .map((watch) => watch.episode);

  const totalWatchedEpisodes = watchedEpisodeNumbers.length;

  const mySeason: SingleSeasonData = {
    totalEpisodes: anime?.numberOfEpisodes ?? 0,
    watchedEpisodes: watchedEpisodeNumbers,
  };

  const backfillKey = `anime:${anime?.id}`;

  const [backfillPrompt, setBackfillPrompt] = useState<{ target: number; previous: number[] } | null>(null);

  const startWatchingMutation = useMutation({
    mutationFn: () =>
      api.post(apiEndpoints.animeProgress, {
        animeId: anime?.id,
        status: "Watching",
        startedAt: new Date(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animeProgress", anime?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["anime", slug] });
    },
  });

  function startWatchingIfNeeded() {
    const current = progressQuery.data;

    if (current && current.status !== "Planning") return;
    if (startWatchingMutation.isPending) return;

    startWatchingMutation.mutate();
  }

  const toggleEpisodeMutation = useMutation({
    mutationFn: ({ episode, watched }: { episode: number; watched: boolean }) => {
      if (watched) {
        return api.delete(apiEndpoints.animeEpisodeWatch, {
          data: { animeId: anime?.id, episode },
        });
      }

      return api.post(apiEndpoints.animeEpisodeWatch, {
        animeId: anime?.id,
        episodes: [{ episode, status: "Completed" }],
      });
    },
    onSuccess: (_data, variables) => {
      if (!variables.watched) startWatchingIfNeeded();

      return queryClient.invalidateQueries({ queryKey: ["animeEpisodeWatch", anime?.id, userId] });
    },
    onError: () => {
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  const markEpisodesMutation = useMutation({
    mutationFn: (episodes: number[]) =>
      api.post(apiEndpoints.animeEpisodeWatch, {
        animeId: anime?.id,
        episodes: episodes.map((episode) => ({ episode, status: "Completed" })),
      }),
    onSuccess: () => {
      setBackfillPrompt(null);
      startWatchingIfNeeded();

      return queryClient.invalidateQueries({ queryKey: ["animeEpisodeWatch", anime?.id, userId] });
    },
    onError: () => {
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  function handleToggle(episode: number) {
    const watched = watchedEpisodeNumbers.includes(episode);

    if (watched) {
      toggleEpisodeMutation.mutate({ episode, watched });
      return;
    }

    const previous = getUnwatchedPreviousEpisodes(
      [{ seasonNumber: 1, totalEpisodes: mySeason.totalEpisodes, watchedEpisodes: watchedEpisodeNumbers }],
      1,
      episode,
    ).map((ref) => ref.episode);
    const preference = getBackfillPreference(backfillKey);

    if (previous.length === 0 || preference === "never") {
      toggleEpisodeMutation.mutate({ episode, watched });
      return;
    }

    if (preference === "always") {
      markEpisodesMutation.mutate([...previous, episode]);
      return;
    }

    setBackfillPrompt({ target: episode, previous });
  }

  function handleBackfillConfirm(remember: boolean) {
    if (!backfillPrompt) return;
    if (remember) setBackfillPreference(backfillKey, "always");

    markEpisodesMutation.mutate([...backfillPrompt.previous, backfillPrompt.target]);
  }

  function handleBackfillDecline(remember: boolean) {
    if (!backfillPrompt) return;
    if (remember) setBackfillPreference(backfillKey, "never");

    toggleEpisodeMutation.mutate({ episode: backfillPrompt.target, watched: false });
    setBackfillPrompt(null);
  }

  const favoriteQuery = useQuery<boolean>({
    queryKey: ["animeFavorite", anime?.id, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetFavoriteStatusResponse>(apiEndpoints.getFavoriteStatus, {
          params: { type: "Anime", animeId: anime?.id },
        })
        .then(({ data }) => data.favorited),
    enabled: isAuthenticated && !!userId && !!anime?.id,
  });

  const isFavorited = !!favoriteQuery.data;

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => {
      const body = { type: "Anime", animeId: anime?.id };

      return isFavorited
        ? api.delete(apiEndpoints.removeFavorite, { data: body })
        : api.post(apiEndpoints.addFavorite, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animeFavorite", anime?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["animeFavorite", anime?.id, userId] });
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
      iconBg: "bg-linear-to-r from-purple-500/20 to-violet-500/20",
      iconBorder: "border-purple-500/30",
      iconColor: "text-purple-400",
      activeClass: "border-purple-400 bg-purple-400/20",
    },
    {
      status: "Watching" as const,
      label: t("feed:lists.watching"),
      icon: "lucide:tv-minimal-play",
      hoverBorder: "hover:border-primary",
      hoverBg: "hover:bg-primary/20",
      iconBg: "bg-linear-to-r from-primary/20 to-secondary/20",
      iconBorder: "border-primary/30",
      iconColor: "text-primary",
      activeClass: "border-primary bg-primary/20",
    },
    {
      status: "Completed" as const,
      label: t("feed:lists.completed"),
      icon: "lucide:check-square",
      hoverBorder: "hover:border-chart-3",
      hoverBg: "hover:bg-chart-3/20",
      iconBg: "bg-linear-to-r from-chart-3/20 to-amber-500/20",
      iconBorder: "border-chart-3/30",
      iconColor: "text-chart-3",
      activeClass: "border-chart-3 bg-chart-3/20",
    },
  ] as const;

  if (isLoading) return <LoadingDetails />;
  if (isError || !anime) return <ErrorComponent />;

  const coverUrl = anime.imageUrl || "/placeholder/cover.webp";

  const sidebar = (
    <>
      <div className="w-full mx-auto shadow-xl rounded-lg overflow-hidden">
        <img src={coverUrl} alt="Capa do anime" className="w-full h-auto object-cover" />
      </div>

      {isAuthenticated && (
        <>
          <QuickStatusButtons
            buttons={
              progressButtons.map((button) => ({
                label: button.label,
                icon: button.icon,
                hoverBorder: button.hoverBorder,
                hoverBg: button.hoverBg,
                iconBg: button.iconBg,
                iconBorder: button.iconBorder,
                iconColor: button.iconColor,
                activeClass: button.activeClass,
                isActive: currentStatus === button.status,
                disabled: setProgressMutation.isPending,
                onClick: () => setProgressMutation.mutate(button.status),
              })) as Parameters<typeof QuickStatusButtons>[0]["buttons"]
            }
          />
          <MoreOptionsDialog
            title={anime.title}
            coverUrl={coverUrl}
            rating={rating}
            subtitle={anime.season && anime.year ? `${anime.season} ${anime.year}` : undefined}
            description={anime.synopsis}
            triggerLabel={t("library:moreOptions")}
            open={moreOpen}
            onOpenChange={setMoreOpen}
            isFavorited={isFavorited}
            onToggleFavorite={() => toggleFavoriteMutation.mutate()}
            favoriteDisabled={toggleFavoriteMutation.isPending || favoriteQuery.isFetching}
          >
            <EpisodicContentModal
              mediaType="anime"
              animeId={anime.id}
              slug={slug}
              totalEpisodes={anime.numberOfEpisodes ?? 0}
              watchedEpisodes={totalWatchedEpisodes}
              onClose={() => setMoreOpen(false)}
            />
          </MoreOptionsDialog>
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
      {isAuthenticated && (
        <RefreshData sourceURL={`https://myanimelist.net/anime/${anime.malId}`} onSubmit={() => mutation.mutate()} />
      )}
      {anime.external.length >= 1 && (
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {(() => {
            const extArr = anime.external || [];
            const links: { href: string; key: string; className?: string; icon: ReactNode }[] = [];

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
                  key: `x-${i}`,
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

            if (anime.malId) {
              links.push({
                href: `https://myanimelist.net/anime/${anime.malId}`,
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
    </>
  );

  return (
    <>
      <DetailsPageLayout sidebar={sidebar}>
        <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
          {anime.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 border-b border-border pb-5">
          {!reviewsQuery.isLoading && !reviewsQuery.isError && reviews?.total >= 1 && (
            <div className="flex items-center gap-2">
              <StarRating value={rating} className="mr-1" />
              <span className="font-semibold text-card-foreground">{rating}</span>
              <span className="text-muted-foreground">
                ({reviews?.total ?? 0} {t("library:reviews")})
              </span>
            </div>
          )}
        </div>

        <Tabs defaultValue="info">
          <div className="flex items-center justify-between gap-3 mb-2">
            <TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
              <TabsTrigger value="info">{t("library:info")}</TabsTrigger>
              {!episodesQuery.isLoading && !episodesQuery.isError && episodes.length > 0 && (
                <TabsTrigger value="episodes">{t("library:episode_other")}</TabsTrigger>
              )}
              <TabsTrigger value="cast">{t("library:cast")}</TabsTrigger>
              <TabsTrigger value="characters">{t("library:characters")}</TabsTrigger>
              <TabsTrigger value="lists">
                {t("library:lists")} ({listsQuery.data?.total ?? 0})
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="info" className="space-y-5">
            <div className={"space-y-3"}>
              <p className="text-muted-foreground leading-relaxed">{anime.synopsis}</p>
              <h3 className="font-semibold text-card-foreground text-lg">{t("library:genres")}</h3>
              <GenrePills genres={anime.genres} getLabel={(g) => getGenreLabel(t, g)} />
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:animeCharacteristics")}</h3>
              <Grid minColSize={"200px"} className="gap-4">
                {anime.type && (
                  <DetailsCard
                    title={t("library:type")}
                    icon={<Icon icon={"lucide:file-pen-line"} className="size-5 text-muted-foreground" />}
                    description={anime.type}
                  />
                )}
                {anime.source && (
                  <DetailsCard
                    title={t("library:source")}
                    icon={<Icon icon={"lucide:hash"} className="size-5 text-muted-foreground" />}
                    description={anime.source}
                  />
                )}
                {anime.numberOfEpisodes && (
                  <DetailsCard
                    title={t("library:totalEpisodes")}
                    icon={<Icon icon={"lucide:tv"} className="size-5 text-muted-foreground" />}
                    description={anime.numberOfEpisodes}
                  />
                )}
                {anime.broadcast.string && (
                  <DetailsCard
                    title={t("library:broadcast")}
                    icon={<Icon icon={"lucide:antenna"} className="size-5 text-muted-foreground" />}
                    description={anime.broadcast.string}
                  />
                )}
                {anime.rating && (
                  <DetailsCard
                    title={t("library:rating")}
                    icon={<Icon icon={"lucide:building"} className="size-5 text-muted-foreground" />}
                    description={anime.rating}
                  />
                )}
                {anime.duration && (
                  <DetailsCard
                    title={t("library:runtime")}
                    icon={<Icon icon={"lucide:clock"} className="size-5 text-muted-foreground" />}
                    description={anime.duration}
                  />
                )}
                {anime.studios.length >= 1 && (
                  <DetailsCard
                    title={t("library:studios")}
                    icon={<Icon icon={"lucide:building-2"} className="size-5 text-muted-foreground" />}
                    description={
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate">{anime.studios[0].name}</span>
                        {anime.studios.length > 1 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="shrink-0 cursor-default rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                                +{anime.studios.length - 1}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <ul className="flex flex-col gap-0.5">
                                {anime.studios.slice(1).map((st: { name: string; malId: number }) => (
                                  <li key={st.malId}>{st.name}</li>
                                ))}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    }
                  />
                )}
                {anime.producers.length >= 1 && (
                  <DetailsCard
                    title={t("library:producers")}
                    icon={<Icon icon={"lucide:languages"} className="size-5 text-muted-foreground" />}
                    description={
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate">{anime.producers[0].name}</span>
                        {anime.producers.length > 1 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="shrink-0 cursor-default rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                                +{anime.producers.length - 1}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <ul className="flex flex-col gap-0.5">
                                {anime.producers.slice(1).map((pd: { name: string; malId: number }) => (
                                  <li key={pd.malId}>{pd.name}</li>
                                ))}
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    }
                  />
                )}
              </Grid>
            </div>

            {anime.relations?.nodes?.length > 0 || anime.relations?.edges?.length > 0 ? (
              <div>
                <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:relations")}</h3>
                <Relations nodes={anime.relations.nodes} edges={anime.relations.edges} />
              </div>
            ) : null}

            {isAuthenticated && (
              <>
                <AnimeEpisodeProgress season={mySeason} onToggle={handleToggle} />
                <BackfillEpisodesDialog
                  open={!!backfillPrompt}
                  onOpenChange={(open) => !open && setBackfillPrompt(null)}
                  episodeCount={backfillPrompt?.previous.length ?? 0}
                  isLoading={markEpisodesMutation.isPending || toggleEpisodeMutation.isPending}
                  onConfirm={handleBackfillConfirm}
                  onDecline={handleBackfillDecline}
                />
              </>
            )}

            <div>
              <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:communityStatistics")}</h3>
              <CommunityStats
                stats={[
                  {
                    label: t("feed:lists.planning"),
                    icon: "lucide:bookmark",
                    iconClass: "text-purple-400",
                    value: `${anime.progressStats?.planToWatch?.percentage ?? 0}%`,
                  },
                  {
                    label: t("feed:lists.watching"),
                    icon: "lucide:tv-minimal-play",
                    iconClass: "text-chart-1",
                    value: `${anime.progressStats?.watching?.percentage ?? 0}%`,
                  },
                  {
                    label: t("feed:lists.completed"),
                    icon: "lucide:check-circle",
                    iconClass: "text-secondary",
                    value: `${anime.progressStats?.completed?.percentage ?? 0}%`,
                  },
                  {
                    label: t("feed:lists.dropped"),
                    icon: "lucide:x-circle",
                    iconClass: "text-destructive",
                    value: `${anime.progressStats?.dropped?.percentage ?? 0}%`,
                  },
                ]}
              />
            </div>

            {anime.trailer.embedUrl && (
              <iframe
                src={anime.trailer.embedUrl.replace("&autoplay=1", "")}
                allowFullScreen
                className="w-full aspect-video"
                sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                title="Trailer"
              />
            )}
          </TabsContent>
          {!episodesQuery.isLoading && !episodesQuery.isError && episodes.length > 0 && (
            <TabsContent value="episodes">
              <Grid minColSize={"200px"} className="gap-4">
                {episodes.map((episode) => (
                  <EpisodeItem
                    key={episode.malId}
                    title={episode.title}
                    number={episode.malId}
                    imageURL={(episode.imageUrl ?? "/placeholder/banner-1.webp").replace(
                      "https://myanimelist.net/images/icon-banned-youtube.png",
                      "/placeholder/banner-1.webp",
                    )}
                  />
                ))}
                {episodesQuery.isFetchingNextPage &&
                  Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="rounded-xl aspect-video" />
                  ))}
              </Grid>
              <div ref={setEpisodesSentinel} className="h-px" />
            </TabsContent>
          )}
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
          <TabsContent value="cast">
            <Grid minColSize={"150px"} className="gap-4">
              {anime.cast?.map((cast: { role: string; name: string; imageUrl: string; positions: string[] }) => (
                <CastItem
                  key={cast.role}
                  name={cast.name}
                  character={cast.positions.map((positions) => positions).join(", ") as string}
                  imageUrl={cast.imageUrl.replace(
                    "https://cdn.myanimelist.net/images/questionmark_23.gif?s=f7dcbc4a4603d18356d3dfef8abd655c",
                    "",
                  )}
                />
              ))}
            </Grid>
          </TabsContent>
          <TabsContent value="characters">
            <Grid minColSize={"150px"} className="gap-4">
              {anime.characters?.map((character: { name: string; imageUrl: string }) => (
                <CharacterItem
                  key={character.name}
                  name={character.name}
                  imageUrl={character.imageUrl.replace(
                    "https://cdn.myanimelist.net/images/questionmark_23.gif?s=f7dcbc4a4603d18356d3dfef8abd655c",
                    "",
                  )}
                />
              ))}
            </Grid>
          </TabsContent>
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
                date={new Date(review.createdAt)}
                criteries={REVIEW_CONTENT.anime.mapCriteries(review)}
                reviewId={review.id}
                reactions={review.reactions}
                onReact={(emoji, currentReaction) =>
                  toggleReaction.mutate(
                    { reviewId: review.id, currentReaction, emoji },
                    { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["animeReviews", anime.id] }) },
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

type AnimeProgressStatus = "Planning" | "Watching" | "Completed";

interface AnimeProgress {
  id: string;
  status: AnimeProgressStatus;
  animeId: string;
  userId: string;
}

interface AnimeEpisodeWatch {
  episode: number;
  status: string;
}

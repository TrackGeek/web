import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { type ReactNode, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Grid } from "@/components/layouts/grid.tsx";
import { CastItem } from "@/components/pages/details/cast";
import { CharacterItem } from "@/components/pages/details/character";
import { CommunityStats } from "@/components/pages/details/community-stats";
import { DetailsPageLayout } from "@/components/pages/details/details-page-layout";
import { GenrePills } from "@/components/pages/details/genre-pills";
import { ListItem } from "@/components/pages/details/list";
import { ListWithMore, type ListWithMoreEntry } from "@/components/pages/details/list-with-more";
import { MoreOptionsDialog } from "@/components/pages/details/more-options-dialog";
import { QuickStatusButtons } from "@/components/pages/details/quick-status-buttons";
import { Relations } from "@/components/pages/details/relations";
import { ReviewItem } from "@/components/pages/details/review-item";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { DetailsCard } from "@/components/shared/cards/details";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { MangaModal } from "@/components/shared/modals/manga";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToggleReviewReaction } from "@/hooks/review";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth/client";
import { ogUrl } from "@/lib/og/url";
import { cn } from "@/lib/utils";
import { formatDateRange } from "@/lib/utils/date";
import { getGenreLabel } from "@/lib/utils/genre-utils.ts";
import { mediaJsonLd } from "@/lib/utils/json-ld";
import { seo } from "@/lib/utils/seo";

interface MangaCast {
  anilistId: number;
  name: string;
  role: string | null;
  imageUrl: string | null;
}

interface MangaTitle {
  type: string;
  title: string;
}

const TITLE_TYPE_LANG: Record<string, string | undefined> = {
  Japanese: "ja",
  English: "en",
};

export const Route = createFileRoute("/manga/$slug")({
  loader: async ({ params }) => {
    const manga = await api.get(apiEndpoints.getMangaDetails(params.slug)).then(({ data }) => data.manga);
    return { manga };
  },
  head: ({ params, loaderData }) => {
    const manga = loaderData?.manga;
    return {
      meta: [
        ...seo({
          title: manga?.title ? manga.title : "Manga Details",
          description: manga?.synopsis ?? undefined,
          image: ogUrl.media("manga", params.slug),
        }),
      ],
      scripts: [
        mediaJsonLd({
          type: "Book",
          name: manga?.title,
          description: manga?.synopsis ?? undefined,
          image: manga?.imageUrl ?? undefined,
          extra: {
            bookFormat: "https://schema.org/GraphicNovel",
            genre: manga?.genres,
          },
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

  const { t, i18n } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["manga", slug],
    queryFn: () => api.get(apiEndpoints.getMangaDetails(slug)).then(({ data }) => data.manga),
    initialData: loaderManga,
  });
  const manga = data;

  const rating = manga?.tgReviewScore ?? 0;

  const reviewsData = useQuery<ApiTypes.PaginatedResponse<ApiTypes.Review>>({
    queryKey: ["mangaReviews", manga.id],
    queryFn: () => api.get(`${apiEndpoints.mangaReview}/?mangaId=${manga.id}`).then(({ data }) => data.mangaReviews),
    enabled: !!manga?.id,
  });
  const reviews = reviewsData?.data;

  const alternativeTitles = useMemo<MangaTitle[]>(() => {
    const seen = new Set<string>([manga?.title?.trim().toLowerCase()].filter(Boolean));
    return ((manga?.titles ?? []) as MangaTitle[]).filter((entry) => {
      const key = entry.title?.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [manga?.titles, manga?.title]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return api.post(apiEndpoints.refreshMangaData, { anilistId: Number(slug) });
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
  const userId = session?.data?.user?.id;
  const [moreOpen, setMoreOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  const toggleReaction = useToggleReviewReaction("manga", userId ?? "");

  const progressQuery = useQuery<ApiTypes.Progress | null>({
    queryKey: ["mangaProgress", manga?.id, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.getMangaProgress(userId as string, manga?.id as string))
        .then(({ data }) => data.mangaProgresses.items[0] ?? null),
    enabled: isAuthenticated && !!userId && !!manga?.id,
  });

  const currentStatus = progressQuery.data?.status;

  const setProgressMutation = useMutation({
    mutationFn: (status: ApiTypes.ProgressStatus) => {
      const current = progressQuery.data;

      if (current && current.status === status) {
        return api.delete(`${apiEndpoints.mangaProgress}/${current.id}`);
      }

      return api.post(apiEndpoints.mangaProgress, {
        mangaId: manga?.id,
        status,
        ...(status === "Reading" && { startedAt: new Date() }),
        ...(status === "Completed" && { completedAt: new Date() }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mangaProgress", manga?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["manga", slug] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const listsQuery = useQuery<ApiTypes.PaginatedResponse<ApiTypes.ListWithPreview>>({
    queryKey: ["mangaContainingLists", manga?.id],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsContainingItemResponse>(apiEndpoints.getListsContainingItem, {
          params: { type: "Manga", mangaId: manga?.id, itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists),
    enabled: !!manga?.id,
  });

  const favoriteQuery = useQuery<boolean>({
    queryKey: ["mangaFavorite", manga?.id, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetFavoriteStatusResponse>(apiEndpoints.getFavoriteStatus, {
          params: { type: "Manga", mangaId: manga?.id },
        })
        .then(({ data }) => data.favorited),
    enabled: isAuthenticated && !!userId && !!manga?.id,
  });

  const isFavorited = !!favoriteQuery.data;

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => {
      const body = { type: "Manga", mangaId: manga?.id };

      return isFavorited
        ? api.delete(apiEndpoints.removeFavorite, { data: body })
        : api.post(apiEndpoints.addFavorite, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mangaFavorite", manga?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["mangaFavorite", manga?.id, userId] });
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  const userListsQuery = useQuery<ApiTypes.List[]>({
    queryKey: ["mangaLists", userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Manga", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items),
    enabled: isAuthenticated && !!userId,
  });

  const listStatusQuery = useQuery<string[]>({
    queryKey: ["mangaListStatus", manga?.id, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListStatusResponse>(apiEndpoints.getListStatus, {
          params: { type: "Manga", mangaId: manga?.id },
        })
        .then(({ data }) => data.listIds),
    enabled: isAuthenticated && !!userId && !!manga?.id,
  });

  const toggleListMutation = useMutation({
    mutationFn: ({ listId, isMember }: { listId: string; isMember: boolean }) => {
      const body = { type: "Manga", listId, userId, mangaId: manga?.id };
      return isMember
        ? api.delete(apiEndpoints.listItem(listId), { data: body })
        : api.post(apiEndpoints.listItem(listId), body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mangaListStatus", manga?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["mangaContainingLists", manga?.id] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const createAndAddListMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post(apiEndpoints.list, { name, userId, type: "Manga" });
      const freshLists = await api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Manga", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items);
      const newList = [...freshLists].reverse().find((l) => l.name === name);
      if (!newList) throw new Error("List not found after creation");
      await api.post(apiEndpoints.listItem(newList.id), {
        type: "Manga",
        listId: newList.id,
        userId,
        mangaId: manga?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mangaLists", userId] });
      queryClient.invalidateQueries({ queryKey: ["mangaListStatus", manga?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["mangaContainingLists", manga?.id] });
      setNewListName("");
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  if (isLoading || reviewsData.isLoading) return <LoadingDetails />;
  if (isError || reviewsData.isError || !manga) return <ErrorComponent />;

  const coverUrl = manga.imageUrl || "/placeholder/cover.webp";
  const publishedRange =
    formatDateRange(manga.published?.from, manga.published?.to, i18n.language, t) ?? manga.published?.string ?? null;

  const castEntry = (person: MangaCast, index: number): ListWithMoreEntry => ({
    key: `${person.anilistId}-${index}`,
    label: (
      <Link
        to="/manga/cast/$slug"
        params={{ slug: String(person.anilistId) }}
        className="underline-offset-4 transition-colors hover:text-primary hover:underline"
      >
        {person.role ? `${person.name} (${person.role})` : person.name}
      </Link>
    ),
  });

  const themes: string[] = (manga.themes ?? []).map((theme: string) => getGenreLabel(t, theme));
  const authors: ListWithMoreEntry[] = (manga.authors ?? []).map(castEntry);
  const staff: ListWithMoreEntry[] = (manga.serializations ?? []).map(castEntry);
  const cast: MangaCast[] = [...(manga.authors ?? []), ...(manga.serializations ?? [])];

  const sidebar = (
    <>
      <div className="w-full mx-auto shadow-xl rounded-lg overflow-hidden">
        <img src={coverUrl} alt={`${manga.title} Cover`} className="w-full h-auto object-cover" />
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
                activeClass: "border-purple-400 bg-purple-400/20",
                isActive: currentStatus === "Planning",
                disabled: setProgressMutation.isPending,
                onClick: () => setProgressMutation.mutate("Planning"),
              },
              {
                label: t("feed:lists.reading"),
                icon: "lucide:book-open-text",
                hoverBorder: "hover:border-primary",
                hoverBg: "hover:bg-primary/20",
                iconBg: "bg-linear-to-r from-primary/20 to-secondary/20",
                iconBorder: "border-primary/30",
                iconColor: "text-primary",
                activeClass: "border-primary bg-primary/20",
                isActive: currentStatus === "Reading",
                disabled: setProgressMutation.isPending,
                onClick: () => setProgressMutation.mutate("Reading"),
              },
              {
                label: t("feed:lists.read"),
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
            title={manga.title}
            coverUrl={coverUrl}
            rating={rating}
            subtitle={publishedRange}
            description={manga.synopsis}
            triggerLabel={t("library:moreOptions")}
            open={moreOpen}
            onOpenChange={setMoreOpen}
            isFavorited={isFavorited}
            onToggleFavorite={() => toggleFavoriteMutation.mutate()}
            favoriteDisabled={toggleFavoriteMutation.isPending || favoriteQuery.isFetching}
          >
            <MangaModal mangaId={manga.id} totalChapters={manga.numberOfChapters} onClose={() => setMoreOpen(false)} />
          </MoreOptionsDialog>
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
        {publishedRange && (
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">{t("library:releaseDate")}</p>
            <p className="font-semibold text-card-foreground">{publishedRange}</p>
          </div>
        )}
      </Grid>

      {alternativeTitles.length > 0 && (
        <div className="bg-muted/50 rounded-lg border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Icon icon="lucide:languages" className="size-4 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">{t("library:alternativeTitles")}</p>
          </div>
          <ul className="divide-y divide-border">
            {alternativeTitles.map((entry) => (
              <li key={`${entry.type}-${entry.title}`} className="px-4 py-3 space-y-1">
                <p
                  className="text-sm font-medium text-card-foreground wrap-break-word"
                  lang={TITLE_TYPE_LANG[entry.type]}
                >
                  {entry.title}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isAuthenticated && (
        <RefreshData lastRefreshedAt={manga.lastRefreshedAt} sourceURL={manga.url} onSubmit={() => mutation.mutate()} />
      )}
      {(manga.external?.length >= 1 || manga.anilistId) && (
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {(() => {
            const extArr = manga.external || [];
            const links: { href: string; key: string; className?: string; icon: ReactNode }[] = [];

            extArr.forEach((e: { url: string; name: string }, i: number) => {
              const name = (e.name || "").toLowerCase();
              const url = e.url;

              if (name.includes("instagram")) {
                links.push({
                  href: url,
                  key: `instagram-${i}`,
                  className: cn(`hover:text-[#FF0069]`),
                  icon: <Icon icon={"simple-icons:instagram"} />,
                });
                return;
              }
              if (name.includes("bilibili")) {
                links.push({
                  href: url,
                  key: `bilibili-${i}`,
                  className: cn(`hover:text-[#00a1d6]`),
                  icon: <Icon icon={"mingcute:bilibili-fill"} />,
                });
                return;
              }
              if (name.includes("naver series")) {
                links.push({
                  href: url,
                  key: `naver-${i}`,
                  className: cn(`hover:text-[#03c75a]`),
                  icon: <Icon icon={"simple-icons:naver"} />,
                });
                return;
              }
              if (name.includes("kakaopage")) {
                links.push({
                  href: url,
                  key: `kakao-${i}`,
                  className: cn(`hover:text-[#ffcd00]`),
                  icon: <Icon icon={"simple-icons:kakao"} />,
                });
                return;
              }
              if (name.includes("shonen jump")) {
                links.push({
                  href: url,
                  key: `shonenjump-${i}`,
                  className: cn(`hover:text-white`),
                  icon: <Icon icon={"arcticons:shonen-jump"} />,
                });
                return;
              }
              if (name.includes("piccoma")) {
                links.push({
                  href: url,
                  key: `piccoma-${i}`,
                  className: cn(`hover:text-white`),
                  icon: <Icon icon={"arcticons:piccoma"} />,
                });
                return;
              }
              if (name.includes("viz")) {
                links.push({
                  href: url,
                  key: `viz-${i}`,
                  className: cn(`hover:text-white`),
                  icon: <Icon icon={"arcticons:viz-manga"} />,
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
              if (name.includes("twitter")) {
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

            if (manga.anilistId) {
              links.push({
                href: `https://anilist.co/manga/${manga.anilistId}`,
                key: "anilist",
                icon: <Icon icon={"simple-icons:anilist"} />,
              });
            }

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
    </>
  );

  return (
    <>
      <DetailsPageLayout sidebar={sidebar}>
        <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
          {manga.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 border-b border-border pb-5">
          <div className="flex items-center gap-2">
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
              <TabsTrigger value="characters">{t("library:characters")}</TabsTrigger>
              {cast.length >= 1 && <TabsTrigger value="staff">{t("library:staff")}</TabsTrigger>}
              <TabsTrigger value="lists">
                {t("library:lists")} ({listsQuery.data?.total ?? 0})
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="info" className="space-y-5">
            <div className={"space-y-3"}>
              <p className="text-muted-foreground leading-relaxed">{manga.synopsis}</p>
              <h3 className="font-semibold text-card-foreground text-lg">{t("library:genres")}</h3>
              <GenrePills genres={manga.genres} type="manga" getLabel={(g) => getGenreLabel(t, g)} />
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
                {themes.length >= 1 && (
                  <DetailsCard
                    title={t("library:themes")}
                    icon={<Icon icon={"lucide:tree-palm"} className="size-5 text-muted-foreground" />}
                    description={<ListWithMore items={themes} />}
                  />
                )}
                {authors.length >= 1 && (
                  <DetailsCard
                    title={t("library:authors")}
                    icon={<Icon icon={"lucide:pen"} className="size-5 text-muted-foreground" />}
                    description={<ListWithMore items={authors} />}
                  />
                )}
                {staff.length >= 1 && (
                  <DetailsCard
                    title={t("library:staff")}
                    icon={<Icon icon={"lucide:notebook"} className="size-5 text-muted-foreground" />}
                    description={<ListWithMore items={staff} />}
                  />
                )}
              </Grid>
            </div>

            {manga.relations?.edges?.length > 0 && manga.relations?.nodes?.length > 1 ? (
              <div>
                <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:relations")}</h3>
                <Relations nodes={manga.relations.nodes} edges={manga.relations.edges} />
              </div>
            ) : null}

            <div>
              <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:communityStatistics")}</h3>
              <CommunityStats
                stats={[
                  {
                    label: t("feed:lists.planning"),
                    icon: "lucide:bookmark",
                    iconClass: "text-purple-400",
                    value: `${manga.progressStats?.planning?.percentage ?? 0}%`,
                    sub: `${manga.progressStats?.planning?.count ?? 0} ${t("library:users")}`,
                  },
                  {
                    label: t("feed:lists.reading"),
                    icon: "lucide:book-open-text",
                    iconClass: "text-chart-1",
                    value: `${manga.progressStats?.reading?.percentage ?? 0}%`,
                    sub: `${manga.progressStats?.reading?.count ?? 0} ${t("library:users")}`,
                  },
                  {
                    label: t("feed:lists.read"),
                    icon: "lucide:check-circle",
                    iconClass: "text-secondary",
                    value: `${manga.progressStats?.completed?.percentage ?? 0}%`,
                    sub: `${manga.progressStats?.completed?.count ?? 0} ${t("library:users")}`,
                  },
                  {
                    label: t("feed:lists.dropped"),
                    icon: "lucide:x-circle",
                    iconClass: "text-destructive",
                    value: `${manga.progressStats?.dropped?.percentage ?? 0}%`,
                    sub: `${manga.progressStats?.dropped?.count ?? 0} ${t("library:users")}`,
                  },
                ]}
              />
            </div>
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
          <TabsContent value="characters">
            <Grid minColSize={"150px"} className="gap-4">
              {manga.characters?.map((character: { anilistId: number; name: string; imageUrl: string | null }) => (
                <CharacterItem key={character.anilistId} name={character.name} imageUrl={character.imageUrl ?? ""} />
              ))}
            </Grid>
          </TabsContent>
          <TabsContent value="staff">
            <Grid minColSize={"150px"} className="gap-4">
              {cast.map((person, index) => (
                <CastItem
                  key={`${person.anilistId}-${index}`}
                  to="/manga/cast/$slug"
                  slug={String(person.anilistId)}
                  name={person.name}
                  character={person.role ?? ""}
                  imageUrl={person.imageUrl}
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
                  art: review.art != null ? Number(review.art) : undefined,
                  worldbuilding: review.worldbuilding != null ? Number(review.worldbuilding) : undefined,
                }}
                reviewId={review.id}
                reactions={review.reactions}
                onReact={(emoji, currentReaction) =>
                  toggleReaction.mutate(
                    { reviewId: review.id, currentReaction, emoji },
                    { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mangaReviews", manga.id] }) },
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

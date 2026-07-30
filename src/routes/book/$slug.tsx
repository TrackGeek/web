import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
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
import { ReviewItem } from "@/components/pages/details/review-item";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { DetailsCard } from "@/components/shared/cards/details";
import { Comments } from "@/components/shared/comments";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { BookModal } from "@/components/shared/modals/book";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { StarRating } from "@/components/shared/star-rating.tsx";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToggleReviewReaction } from "@/hooks/review";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { ogUrl } from "@/lib/og/url";
import { getGenreLabel, isKnownGenre } from "@/lib/utils/genre-utils.ts";
import { mediaJsonLd } from "@/lib/utils/json-ld";
import { seo } from "@/lib/utils/seo";

interface BookEdition {
  id: number;
  title: string | null;
  imageUrl: string | null;
  language: string | null;
  publisher: string | null;
  numberOfPages: number | null;
  isbn10: string | null;
  isbn13: string | null;
  releaseYear: number | null;
  releaseDate: string | null;
  editionFormat: string | null;
}

interface BookContribution {
  contribution: string | null;
  author: { id: number; name: string; imageUrl: string | null };
}

interface BookSeriesEntry {
  id: number;
  position: number | null;
  featured: boolean;
  series: { id: number; name: string };
}

type ProgressStatus = "Planning" | "Reading" | "Completed";

interface BookProgress {
  id: string;
  status: ProgressStatus;
  bookId: string;
  userId: string;
}

/** Hardcover sends the cover either as a plain URL or as an `{ url }` object. */
function coverOf(imageUrl: unknown): string | null {
  if (typeof imageUrl === "string") return imageUrl || null;
  if (imageUrl && typeof imageUrl === "object" && "url" in imageUrl) {
    const { url } = imageUrl as { url?: string | null };
    return url || null;
  }
  return null;
}

function authorNames(contributions: BookContribution[] | null | undefined): string[] {
  return (contributions ?? []).map((c) => c.author?.name).filter((name): name is string => !!name);
}

function primaryEdition(book: { defaultPhysicalEdition?: BookEdition | null; editions?: BookEdition[] | null }) {
  return book.defaultPhysicalEdition ?? book.editions?.[0] ?? null;
}

export const Route = createFileRoute("/book/$slug")({
  loader: async ({ params }) => {
    const book = await api.get(apiEndpoints.getBookDetails(params.slug)).then(({ data }) => data.book);
    return { book };
  },
  head: ({ params, loaderData }) => {
    const book = loaderData?.book;
    const authors = authorNames(book?.contributions).join(", ");
    const edition = book ? primaryEdition(book) : null;
    const cover = coverOf(book?.imageUrl) ?? undefined;

    return {
      meta: [
        ...seo({
          title: book?.title ? book.title : "Book Details",
          description: book?.description ? `${authors ? `${authors} · ` : ""}${book.description}` : undefined,
          image: ogUrl.media("book", params.slug),
        }),
      ],
      scripts: [
        mediaJsonLd({
          type: "Book",
          name: book?.title,
          description: book?.description ?? undefined,
          image: cover,
          rating: book?.tgReviewScore ?? undefined,
          extra: {
            author: authorNames(book?.contributions).map((name) => ({ "@type": "Person", name })),
            isbn: edition?.isbn13 ?? edition?.isbn10 ?? undefined,
            numberOfPages: book?.numberOfPages ?? undefined,
            datePublished: book?.releaseDate ? new Date(book.releaseDate).toISOString() : undefined,
          },
        }),
      ],
    };
  },
  component: BookDetailsRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

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

function BookDetailsRoute() {
  const { slug } = Route.useParams();
  const { book: loaderBook } = Route.useLoaderData();
  const { t } = useTranslation();

  const [moreOpen, setMoreOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["book", slug],
    queryFn: () => api.get(apiEndpoints.getBookDetails(slug)).then(({ data }) => data.book),
    initialData: loaderBook,
  });
  const book = data;

  const rating = book?.tgReviewScore ?? 0;

  const queryClient = useQueryClient();
  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  const userId = session?.data?.user?.id;

  const reviewsQuery = useQuery({
    queryKey: ["bookReviews", book?.id],
    queryFn: () =>
      api
        .get<ApiTypes.GetReviewsResponse>(`${apiEndpoints.bookReview}/?bookId=${book?.id}`)
        .then(({ data }) => data.bookReviews),
    enabled: !!book?.id,
  });

  const reviews = reviewsQuery.data;

  const mutation = useMutation({
    mutationFn: () => {
      return api.post(apiEndpoints.refreshBookData, { hardcoverId: Number(slug) });
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["book", slug] });
    },
    onError: () => {
      return toast.error(t("api:BOOK_ALREADY_REFRESHED"));
    },
  });

  const listsQuery = useQuery<ApiTypes.PaginatedResponse<ApiTypes.ListWithPreview>>({
    queryKey: ["bookContainingLists", book?.id],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsContainingItemResponse>(apiEndpoints.getListsContainingItem, {
          params: { type: "Book", bookId: book?.id, itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists),
    enabled: !!book?.id,
  });

  const userListsQuery = useQuery<ApiTypes.List[]>({
    queryKey: ["bookLists", userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Book", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items),
    enabled: isAuthenticated && !!userId,
  });

  const listStatusQuery = useQuery<string[]>({
    queryKey: ["bookListStatus", book?.id, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetListStatusResponse>(apiEndpoints.getListStatus, {
          params: { type: "Book", bookId: book?.id },
        })
        .then(({ data }) => data.listIds),
    enabled: isAuthenticated && !!userId && !!book?.id,
  });

  const toggleListMutation = useMutation({
    mutationFn: ({ listId, isMember }: { listId: string; isMember: boolean }) => {
      const body = { type: "Book", listId, userId, bookId: book?.id };
      return isMember
        ? api.delete(apiEndpoints.listItem(listId), { data: body })
        : api.post(apiEndpoints.listItem(listId), body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookListStatus", book?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["bookContainingLists", book?.id] });
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const createAndAddListMutation = useMutation({
    mutationFn: async (name: string) => {
      await api.post(apiEndpoints.list, { name, userId, type: "Book" });
      const freshLists = await api
        .get<ApiTypes.GetListsByUserIdResponse>(apiEndpoints.getListsByUserId(userId as string), {
          params: { type: "Book", itemsPerPage: 50 },
        })
        .then(({ data }) => data.lists.items);
      const newList = [...freshLists].reverse().find((l) => l.name === name);
      if (!newList) throw new Error("List not found after creation");
      await api.post(apiEndpoints.listItem(newList.id), { type: "Book", listId: newList.id, userId, bookId: book?.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookLists", userId] });
      queryClient.invalidateQueries({ queryKey: ["bookListStatus", book?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["bookContainingLists", book?.id] });
      setNewListName("");
    },
    onError: () => toast.error(t("api:INTERNAL_SERVER_ERROR")),
  });

  const toggleReaction = useToggleReviewReaction("book", userId ?? "");

  const progressQuery = useQuery<BookProgress | null>({
    queryKey: ["bookProgress", book?.id, userId],
    queryFn: () =>
      api
        .get(apiEndpoints.getBookProgress(userId as string, book?.id as string))
        .then(({ data }) => data.bookProgresses.items[0] ?? null),
    enabled: isAuthenticated && !!userId && !!book?.id,
  });

  const currentStatus = progressQuery.data?.status;

  const setProgressMutation = useMutation({
    mutationFn: (status: ProgressStatus) => {
      const current = progressQuery.data;

      if (current && current.status === status) {
        return api.delete(`${apiEndpoints.bookProgress}/${current.id}`);
      }

      return api.post(apiEndpoints.bookProgress, {
        bookId: book?.id,
        status,
        ...(status === "Reading" && { startedAt: new Date() }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookProgress", book?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["book", slug] });
    },
    onError: () => {
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  const favoriteQuery = useQuery<boolean>({
    queryKey: ["bookFavorite", book?.id, userId],
    queryFn: () =>
      api
        .get<ApiTypes.GetFavoriteStatusResponse>(apiEndpoints.getFavoriteStatus, {
          params: { type: "Book", bookId: book?.id },
        })
        .then(({ data }) => data.favorited),
    enabled: isAuthenticated && !!userId && !!book?.id,
  });

  const isFavorited = !!favoriteQuery.data;

  const toggleFavoriteMutation = useMutation({
    mutationFn: () => {
      const body = { type: "Book", bookId: book?.id };

      return isFavorited
        ? api.delete(apiEndpoints.removeFavorite, { data: body })
        : api.post(apiEndpoints.addFavorite, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookFavorite", book?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["bookFavorite", book?.id, userId] });
      return toast.error(t("api:INTERNAL_SERVER_ERROR"));
    },
  });

  if (isLoading) return <LoadingDetails />;
  if (isError || !book) return <ErrorComponent />;

  const coverUrl = coverOf(book.imageUrl) ?? "/placeholder/cover.webp";
  const authors = authorNames(book.contributions);
  const tags: string[] = (book.taggings ?? [])
    .map((tagging: { tag: string }) => tagging.tag)
    .filter((tag: string) => isKnownGenre(t, tag));
  const editions: BookEdition[] = book.editions ?? [];
  const edition = primaryEdition(book);
  const series: BookSeriesEntry[] = book.bookSeries ?? [];
  const releaseDate = book.releaseDate
    ? new Date(book.releaseDate).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  const sidebar = (
    <>
      <div className="w-full mx-auto shadow-xl rounded-lg overflow-hidden">
        <img src={coverUrl} alt={`${book.title} Cover`} className="w-full h-auto object-cover" />
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
            title={book.title}
            coverUrl={coverUrl}
            rating={rating}
            subtitle={releaseDate ?? String(book.releaseYear ?? "")}
            description={book.description}
            triggerLabel={t("library:moreOptions")}
            open={moreOpen}
            onOpenChange={setMoreOpen}
            isFavorited={isFavorited}
            onToggleFavorite={() => toggleFavoriteMutation.mutate()}
            favoriteDisabled={toggleFavoriteMutation.isPending || favoriteQuery.isFetching}
          >
            <BookModal bookId={book.id} totalPages={book.numberOfPages} onClose={() => setMoreOpen(false)} />
          </MoreOptionsDialog>
        </>
      )}

      <div className="border-t border-border" />

      <Grid minColSize={"128px"} className="gap-4">
        {book.numberOfPages && (
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">{t("library:page_other")}</p>
            <p className="font-semibold text-card-foreground">{book.numberOfPages}</p>
          </div>
        )}
        {releaseDate && (
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">{t("library:releaseDate")}</p>
            <p className="font-semibold text-card-foreground">{releaseDate}</p>
          </div>
        )}
      </Grid>
      {isAuthenticated && (
        <RefreshData sourceURL={`https://hardcover.app/books/${book.slug}`} onSubmit={() => mutation.mutate()} />
      )}
    </>
  );

  return (
    <>
      <DetailsPageLayout sidebar={sidebar}>
        <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
          {book.title}
        </h1>

        {series.length > 0 && (
          <div className="flex items-center gap-2">
            <Icon icon={"lucide:book-copy"} className="size-5 shrink-0 text-muted-foreground" />
            <span className="text-xl text-muted-foreground">
              {series
                .map((entry) => (entry.position ? `${entry.series.name} #${entry.position}` : entry.series.name))
                .join(", ")}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-6 pb-5 border-b border-border">
          <div className="flex items-center gap-2">
            <StarRating value={rating} />
            <span className="font-semibold text-card-foreground">{rating}</span>
            <span className="text-muted-foreground">
              ({reviews?.total ?? 0} {t("library:reviews")})
            </span>
          </div>

          {book.numberOfPages && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon icon={"lucide:bar-chart-3"} className="size-5" />
              <span>
                {t("library:medium")}: {Math.round(book.numberOfPages / 29)} {t("library:days")}
              </span>
            </div>
          )}
        </div>

        <Tabs defaultValue="info">
          <div className="flex items-center justify-between gap-3 mb-2">
            <TabsList className="w-full max-sm:overflow-x-auto items-center justify-start">
              <TabsTrigger value="info">{t("library:info")}</TabsTrigger>
              {editions.length >= 1 && (
                <TabsTrigger value="editions">
                  {t("library:editions")} ({book.editionsCount ?? editions.length})
                </TabsTrigger>
              )}
              <TabsTrigger value="lists">
                {t("library:lists")} ({listsQuery.data?.total ?? 0})
              </TabsTrigger>
              <TabsTrigger value="comments">{t("comments:title")}</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="info" className="space-y-5">
            <div className={"space-y-3"}>
              <p className="text-muted-foreground leading-relaxed">{book.description}</p>
              {tags.length > 0 && (
                <>
                  <h3 className="font-semibold text-card-foreground text-lg">{t("library:genres")}</h3>
                  <GenrePills genres={tags} getLabel={(g) => getGenreLabel(t, g)} />
                </>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:bookCharacteristics")}</h3>
              <Grid minColSize={"200px"} className="gap-4 items-start">
                {authors.length > 0 && (
                  <DetailsCard
                    title={t("library:authors")}
                    icon={<Icon icon={"lucide:pen"} className="size-5 text-muted-foreground" />}
                    description={<ListWithMore items={authors} />}
                  />
                )}
                {book.bookCategory?.name && (
                  <DetailsCard
                    title={t("library:category")}
                    icon={<Icon icon={"lucide:library"} className="size-5 text-muted-foreground" />}
                    description={book.bookCategory.name}
                  />
                )}
                {edition?.publisher && (
                  <DetailsCard
                    title={t("library:publisher")}
                    icon={<Icon icon={"lucide:notebook"} className="size-5 text-muted-foreground" />}
                    description={edition.publisher}
                  />
                )}
                {edition?.language && (
                  <DetailsCard
                    title={t("common:language")}
                    icon={<Icon icon={"lucide:languages"} className="size-5 text-muted-foreground" />}
                    description={edition.language}
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
                    value: `${book.progressStats?.planToRead?.percentage ?? 0}%`,
                  },
                  {
                    label: t("feed:lists.reading"),
                    icon: "lucide:book-open-text",
                    iconClass: "text-chart-1",
                    value: `${book.progressStats?.reading?.percentage ?? 0}%`,
                  },
                  {
                    label: t("feed:lists.read"),
                    icon: "lucide:check-circle",
                    iconClass: "text-secondary",
                    value: `${book.progressStats?.completed?.percentage ?? 0}%`,
                  },
                  {
                    label: t("feed:lists.dropped"),
                    icon: "lucide:x-circle",
                    iconClass: "text-destructive",
                    value: `${book.progressStats?.dropped?.percentage ?? 0}%`,
                  },
                ]}
              />
            </div>
          </TabsContent>

          {editions.length >= 1 && (
            <TabsContent value="editions">
              <Grid minColSize={"240px"} className="gap-4 items-start">
                {editions.map((item) => (
                  <EditionCard key={item.id} edition={item} fallbackTitle={book.title} />
                ))}
              </Grid>
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

          <TabsContent value="comments">
            <Comments
              type="Book"
              bookId={book.id}
              showTitle={false}
              containerClassName="border-0 bg-transparent p-0 shadow-none"
              headerClassName="p-0"
              contentClassName="p-0"
            />
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
            {reviews?.items.map((review) => (
              <ReviewItem
                key={review.id}
                user={review.user}
                reviewText={review.summary ?? ""}
                notes={review.notes}
                date={new Date(review.createdAt)}
                criteries={{
                  all: Number(review.overall),
                  characters: review.characters != null ? Number(review.characters) : undefined,
                  language: review.language != null ? Number(review.language) : undefined,
                  theme: review.theme != null ? Number(review.theme) : undefined,
                }}
                reviewId={review.id}
                reactions={review.reactions}
                onReact={(emoji, currentReaction) =>
                  toggleReaction.mutate(
                    { reviewId: review.id, currentReaction, emoji },
                    { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookReviews", book.id] }) },
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

function EditionCard({ edition, fallbackTitle }: { edition: BookEdition; fallbackTitle: string }) {
  const { t } = useTranslation();

  const cover = coverOf(edition.imageUrl);
  const meta = [edition.editionFormat, edition.language, edition.releaseYear ? String(edition.releaseYear) : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex gap-3 p-3 bg-muted/50 rounded-lg border border-border">
      <Image
        src={cover ?? "/placeholder/cover.webp"}
        width={72}
        height={108}
        alt={edition.title ?? fallbackTitle}
        className="w-18 h-27 shrink-0 object-cover rounded-md"
      />
      <div className="flex-1 min-w-0 space-y-1">
        <p className="font-medium text-card-foreground line-clamp-2">{edition.title ?? fallbackTitle}</p>
        {edition.publisher && <p className="text-sm text-muted-foreground line-clamp-1">{edition.publisher}</p>}
        {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
        {!!edition.numberOfPages && (
          <p className="text-xs text-muted-foreground">
            {edition.numberOfPages} {t("library:page_other")}
          </p>
        )}
        {edition.isbn13 && <p className="text-xs text-muted-foreground">ISBN 13: {edition.isbn13}</p>}
        {edition.isbn10 && <p className="text-xs text-muted-foreground">ISBN 10: {edition.isbn10}</p>}
      </div>
    </div>
  );
}

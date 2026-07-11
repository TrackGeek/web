import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Grid } from "@/components/layouts/grid.tsx";
import { CommunityStats } from "@/components/pages/details/community-stats";
import { DetailsPageLayout } from "@/components/pages/details/details-page-layout";
import { ListItem } from "@/components/pages/details/list";
import { MoreOptionsDialog } from "@/components/pages/details/more-options-dialog";
import { QuickStatusButtons } from "@/components/pages/details/quick-status-buttons";
import { ReviewItem } from "@/components/pages/details/review-item";
import { NotFoundComponent } from "@/components/shared/404.tsx";
import { DetailsCard } from "@/components/shared/cards/details";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingDetails } from "@/components/shared/loadings/details.tsx";
import { BookModal } from "@/components/shared/modals/book";
import { RefreshData } from "@/components/shared/modals/refresh-data";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";
import { useSession } from "@/lib/auth.ts";
import { seo } from "@/lib/utils/seo";

export const Route = createFileRoute("/book/$slug")({
  loader: async ({ params }) => {
    const book = await api.get(apiEndpoints.getBookDetails(params.slug)).then(({ data }) => data.book);
    return { book };
  },
  head: ({ loaderData }) => {
    const book = loaderData?.book;
    const authors = book?.contributions?.map((c: { author: { name: string } }) => c.author.name).join(", ");

    return {
      meta: [
        ...seo({
          title: book?.title ? book.title : "Book Details",
          description: book?.description ? `${authors ? `${authors} · ` : ""}${book.description}` : undefined,
          image: book?.imageUrl ?? undefined,
        }),
      ],
    };
  },
  component: BookDetailsRoute,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function BookDetailsRoute() {
  const { slug } = Route.useParams();
  const { book: loaderBook } = Route.useLoaderData();
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["book", slug],
    queryFn: () => api.get(apiEndpoints.getBookDetails(slug)).then(({ data }) => data.book),
    initialData: loaderBook,
  });
  const book = data;
  const rating = 4.2;

  const reviewsData = useQuery({
    queryKey: ["bookReviews", book.id],
    queryFn: () => api.get(`${apiEndpoints.bookReview}/?bookId=${book.id}`).then(({ data }) => data.bookReviews),
    enabled: !!book?.id,
  });
  const reviews = reviewsData?.data ?? { total: 0 };

  const queryClient = useQueryClient();

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

  const session = useSession();
  const isAuthenticated = !!session?.data?.session;
  const [moreOpen, setMoreOpen] = useState(false);
  if (isLoading || reviewsData.isLoading) return <LoadingDetails />;
  if (isError || reviewsData.isError || !book) return <ErrorComponent />;

  const coverUrl = book.imageUrl || "/placeholder/cover.webp";

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
              },
              {
                label: t("feed:lists.reading"),
                icon: "lucide:book-open-text",
                hoverBorder: "hover:border-primary",
                hoverBg: "hover:bg-primary/20",
                iconBg: "bg-linear-to-r from-primary/20 to-secondary/20",
                iconBorder: "border-primary/30",
                iconColor: "text-primary",
              },
              {
                label: t("feed:lists.read"),
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
            title={book.title}
            coverUrl={coverUrl}
            rating={rating}
            subtitle={String(book.releaseYear)}
            description={book.description}
            triggerLabel={t("library:moreOptions")}
            open={moreOpen}
            onOpenChange={setMoreOpen}
          >
            <BookModal />
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
        {book.releaseYear && (
          <div className="bg-muted/50 p-4 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">{t("library:year")}</p>
            <p className="font-semibold text-card-foreground">{book.releaseYear}</p>
          </div>
        )}
      </Grid>
      <RefreshData sourceURL={`https://hardcover.app/books/${book.slug}`} onSubmit={() => mutation.mutate()} />
    </>
  );

  return (
    <>
      <DetailsPageLayout sidebar={sidebar}>
        <h1 className="text-3xl lg:text-4xl font-bold text-card-foreground bg-linear-to-r from-card-foreground to-muted-foreground bg-clip-text">
          {book.title}
        </h1>
        <div className="flex items-center gap-2">
          <Icon icon={"lucide:user"} className="size-5 text-muted-foreground" />
          {book.contributions.map((contribution: { author: { id: string; name: string } }, index: number) => (
            <span key={contribution.author.id}>
              <Link to={`/`} search={{ landing: "true" }} className="text-xl text-muted-foreground">
                {contribution.author.name}
              </Link>
              {index < book.contributions.length - 1 && ", "}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Icon icon={"lucide:book-copy"} className="size-5 text-muted-foreground" />
          <Link to={"/"} search={{ landing: "true" }} className="text-xl text-muted-foreground">
            series_names (can be hidden if not exists)
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-6 pb-5 border-b border-border">
          {!reviewsData.isLoading && !reviewsData.isError && reviews.total >= 1 && (
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
            <TabsList className="w-full">
              <TabsTrigger value="info">{t("library:info")}</TabsTrigger>
              <TabsTrigger value="lists">{t("library:lists")} (30)</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="info" className="space-y-5">
            <div className={"space-y-3"}>
              <p className="text-muted-foreground leading-relaxed">{book.description}</p>
              <h3 className="font-semibold text-card-foreground text-lg">{t("library:genres")}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-linear-to-r from-chart-1/20 to-chart-1/30 text-chart-1 border border-chart-1/30 rounded-full text-sm font-medium">
                  Fantasia
                </span>
                <span className="px-3 py-1.5 bg-linear-to-r from-purple-500/20 to-purple-500/30 text-purple-400 border border-purple-500/30 rounded-full text-sm font-medium">
                  Aventura
                </span>
                <span className="px-3 py-1.5 bg-linear-to-r from-chart-3/20 to-chart-3/30 text-chart-3 border border-chart-3/30 rounded-full text-sm font-medium">
                  Épico
                </span>
                <span className="px-3 py-1.5 bg-linear-to-r from-primary/20 to-primary/30 text-primary border border-primary/30 rounded-full text-sm font-medium">
                  Magia
                </span>
                <span className="px-3 py-1.5 bg-linear-to-r from-chart-4/20 to-chart-4/30 text-chart-4 border border-chart-4/30 rounded-full text-sm font-medium">
                  Drama
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground text-lg mb-4">{t("library:bookCharacteristics")}</h3>
              <Grid minColSize={"200px"} className="gap-4">
                <DetailsCard
                  title="ISBN 10"
                  icon={<Icon icon={"lucide:scan-barcode"} className="size-5 text-muted-foreground" />}
                  description={"6555117737"}
                />
                <DetailsCard
                  title="ISBN 13"
                  icon={<Icon icon={"lucide:barcode"} className="size-5 text-muted-foreground" />}
                  description={"9786555117738"}
                />
                <DetailsCard
                  title={t("library:mood")}
                  icon={<Icon icon={"lucide:heart"} className="size-5 text-muted-foreground" />}
                  description={"Intenso"}
                />
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
                    value: "5%",
                  },
                  { label: t("feed:lists.read"), icon: "lucide:book-open", iconClass: "text-chart-1", value: "15%" },
                  {
                    label: t("feed:lists.reading"),
                    icon: "lucide:check-circle",
                    iconClass: "text-secondary",
                    value: "72%",
                  },
                  {
                    label: t("feed:lists.dropped"),
                    icon: "lucide:x-circle",
                    iconClass: "text-destructive",
                    value: "8%",
                  },
                ]}
              />
            </div>

            <div>
              <h3 className="font-semibold text-card-foreground text-lg mb-3">{t("library:contentWarnings")}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 blur-sm hover:blur-none transition-all bg-linear-to-r from-chart-1/20 to-chart-1/30 text-chart-1 border border-chart-1/30 rounded-full text-sm font-medium">
                  Violência
                </span>
                <span className="px-3 py-1.5 blur-sm hover:blur-none transition-all bg-linear-to-r from-purple-500/20 to-purple-500/30 text-purple-400 border border-purple-500/30 rounded-full text-sm font-medium">
                  Morte
                </span>
                <span className="px-3 py-1.5 blur-sm hover:blur-none transition-all bg-linear-to-r from-chart-3/20 to-chart-3/30 text-chart-3 border border-chart-3/30 rounded-full text-sm font-medium">
                  Linguagem Forte
                </span>
                <span className="px-3 py-1.5 blur-sm hover:blur-none transition-all bg-linear-to-r from-primary/20 to-primary/30 text-primary border border-primary/30 rounded-full text-sm font-medium">
                  Vergonha Corporal
                </span>
                <span className="px-3 py-1.5 blur-sm hover:blur-none transition-all bg-linear-to-r from-chart-4/20 to-chart-4/30 text-chart-4 border border-chart-4/30 rounded-full text-sm font-medium">
                  Disablismo
                </span>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="lists">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ListItem
                list={
                  {
                    _count: { listItems: 0 },
                    listItems: [],
                    name: "",
                    user: { name: "", profile: null },
                  } as unknown as ApiTypes.ListWithPreview
                }
              />
            </div>
          </TabsContent>
        </Tabs>
      </DetailsPageLayout>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-card-foreground text-lg capitalize">
            {t("library:reviews")} ({reviews.total})
          </h3>
          {isAuthenticated && (
            <Button variant="outline" size="sm" className="shrink-0 gap-2" onClick={() => setMoreOpen(true)}>
              <Icon icon="lucide:pen-line" className="size-4" />
              {t("feed:review")}
            </Button>
          )}
        </div>
        {!reviewsData.isLoading && !reviewsData.isError && reviews.total >= 1 ? (
          <ReviewItem
            user={
              {
                name: "John Doe",
                avatarURL: "https://assets.hardcover.app/editions/30399846/4434002844651.jpg",
                slug: "john-doe",
              } as unknown as ApiTypes.User
            }
            reviewText={
              "Very foda! AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA Este livro é uma obra-prima que merece ser lida por todos os amantes de boa literatura. BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA BLA A forma como o autor desenvolve os personagens é simplesmente magnífica, cada um com sua própria voz e personalidade única."
            }
            criteries={{ language: 5, characters: 4, all: 10, story: 8, theme: 9 }}
            date={new Date("2023-06-19")}
          />
        ) : (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="lucide:star" />
              </EmptyMedia>
              <EmptyTitle>{t("library:noReviews")}</EmptyTitle>
              <EmptyDescription>{t("library:noReviewsDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </>
  );
}

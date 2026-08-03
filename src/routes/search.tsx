import { Icon } from "@iconify/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { AxiosResponse } from "axios";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { type ContentType, type FilterParams } from "@/components/layouts/filters.tsx";
import { Grid } from "@/components/layouts/grid";
import { CardItem } from "@/components/shared/cards/card";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFiltered } from "@/components/shared/loadings/filtered.tsx";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { seo } from "@/lib/utils/seo";
import { useDebounce } from "@/lib/utils/useDebounce.ts";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll.ts";

const CONTENT_TYPES: { value: ContentType; labelKey: string }[] = [
  { value: "movie", labelKey: "common:types.movie" },
  { value: "tv", labelKey: "common:types.tv" },
  { value: "game", labelKey: "common:types.game" },
  { value: "anime", labelKey: "common:types.anime" },
  { value: "manga", labelKey: "common:types.manga" },
  { value: "book", labelKey: "common:types.book" },
];

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [...seo({ title: "Search" })],
  }),
  beforeLoad: ({ search }) => {
    if (!(search as { type?: string }).type) {
      throw redirect({ to: "/search", search: { type: "movie" }, replace: true });
    }
  },
  component: RouteComponent,
});

function buildSearchUrl(contentType: ContentType, query: string = "A", filters: FilterParams, page: number): string {
  const qs = new URLSearchParams();

  if (page > 1) qs.set("page", String(page));
  if (query) qs.set("query", query);
  if (filters.status) qs.set("status", filters.status);
  if (filters.genres?.length) qs.set("genres", filters.genres.join(","));
  if (filters.year) qs.set("year", filters.year);
  if (filters.sort) qs.set("orderBy", filters.sort);
  if (filters.minEpisodes != null) qs.set("minEpisodes", String(filters.minEpisodes));
  if (filters.minReading != null) qs.set("minReading", String(filters.minReading));
  if (filters.gameModes?.length) qs.set("gameModes", filters.gameModes.join(","));

  const qsStr = qs.toString();
  return qsStr ? `/${contentType}/search?${qsStr}` : `/${contentType}/search`;
}

function getItemsFromPage(page: AxiosResponse, contentType: ContentType) {
  const data = page?.data;
  switch (contentType) {
    case "movie":
      return data?.movies?.items ?? [];
    case "tv":
      return data?.tvShows?.items ?? [];
    case "anime":
      return data?.animes?.items ?? [];
    case "manga":
      return data?.mangas?.items ?? [];
    case "book":
      return data?.books?.items ?? [];
    case "game":
      return data?.games?.items ?? [];
    default:
      return [];
  }
}

function getPaginationFromPage(page: AxiosResponse, contentType: ContentType) {
  const data = page?.data;
  switch (contentType) {
    case "anime":
      return data?.animes;
    case "manga":
      return data?.mangas;
    case "book":
      return data?.books;
    case "game":
      return data?.games;
    case "movie":
      return data?.movies;
    case "tv":
      return data?.tvShows;
    default:
      return undefined;
  }
}

type SearchResultsProps = {
  items: ReturnType<typeof getItemsFromPage>;
  contentType: ContentType;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  sentinelRef: React.Ref<HTMLDivElement>;
};

const SearchResults = memo(
  ({ items, contentType, isLoading, isError, isFetchingNextPage, sentinelRef }: SearchResultsProps) => {
    const { t } = useTranslation();

    return (
      <div className="flex-1 md:w-2/3 space-y-4">
        {isError && <ErrorComponent />}

        {isLoading && <LoadingFiltered />}

        {!isLoading && !isError && items.length === 0 && (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="lucide:search-x" />
              </EmptyMedia>
              <EmptyTitle>{t("user:noSearchResults")}</EmptyTitle>
              <EmptyDescription>{t("user:noSearchResultsDescription")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <Grid minColSize="128px" className="grid gap-6">
            {items.map((item: any) => (
              <CardItem
                key={item.anilistId ?? item.malId ?? item.tmdbId ?? item.hardcoverId ?? item.igdbId}
                title={item.title ?? item.name}
                url={`/${contentType}/${item.anilistId ?? item.malId ?? item.tmdbId ?? item.hardcoverId ?? item.igdbId}`}
                imageURL={item.imageUrl ?? item.coverUrl ?? item.posterUrl ?? null}
                isAdult={item.isAdult}
              />
            ))}
          </Grid>
        )}

        <div ref={sentinelRef} className="h-px" />

        {isFetchingNextPage && <LoadingFiltered />}
      </div>
    );
  },
);

function RouteComponent() {
  const [contentType, setContentType] = useQueryState(
    "type",
    parseAsStringLiteral(CONTENT_TYPES.map((c) => c.value))
      .withDefault("movie")
      .withOptions({ clearOnDefault: false }),
  );

  const [searchQuery, setSearchQuery] = useQueryState("query", parseAsString.withDefault(""));
  const [filters, setFilters] = useState<FilterParams>({});

  const debouncedQuery = useDebounce(searchQuery, 600);

  const { t } = useTranslation();

  const handleContentTypeChange = (value: string) => {
    setContentType(value as ContentType);
    setSearchQuery("");
    setFilters({});
  };

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["search", contentType, debouncedQuery, filters],
    queryFn: ({ pageParam }) => api.get(buildSearchUrl(contentType, debouncedQuery, filters, pageParam as number)),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = getPaginationFromPage(lastPage, contentType);
      if (!pagination) return undefined;

      const current = pagination.inPage ?? 1;

      if (pagination.pages != null) return current < pagination.pages ? current + 1 : undefined;
      if (pagination.itemsPerPage != null)
        return pagination.itemsInPage >= pagination.itemsPerPage ? current + 1 : undefined;

      return undefined;
    },
  });

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();

      setSearchQuery(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const items = useMemo(() => {
    const seen = new Set<number | string>();

    return (data?.pages.flatMap((p) => getItemsFromPage(p, contentType)) ?? []).filter((item: any) => {
      const id = item.malId ?? item.tmdbId ?? item.hardcoverId ?? item.igdbId;

      if (id == null) return true;
      if (seen.has(id)) return false;

      seen.add(id);

      return true;
    });
  }, [data, contentType]);

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="w-full sm:w-32">
            <Select value={contentType} onValueChange={handleContentTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(type.labelKey)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 relative w-full">
            <Input
              placeholder={`${t("user:search")}...`}
              className="bg-muted/50 flex-1 pr-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="button"
              onClick={handlePaste}
              aria-label={t("user:pasteFromClipboard")}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <Icon icon={"lucide:clipboard"} className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex max-sm:flex-col gap-5">
          <SearchResults
            items={items}
            contentType={contentType}
            isLoading={isLoading}
            isError={isError}
            isFetchingNextPage={isFetchingNextPage}
            sentinelRef={sentinelRef}
          />
        </div>
      </div>
    </div>
  );
}

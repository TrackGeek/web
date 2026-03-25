import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clipboard } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { type ContentType, type FilterParams, Filters } from "@/components/layouts/filters.tsx";
import { Grid } from "@/components/layouts/grid";
import { CardItem } from "@/components/shared/cards/card";
import { ErrorComponent } from "@/components/shared/error.tsx";
import { LoadingFiltered } from "@/components/shared/loadings/filtered.tsx";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { seo } from "@/lib/utils/seo";
import { useDebounce } from "@/lib/utils/useDebounce.ts";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll.ts";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [...seo({ title: "Search" })],
  }),
  component: RouteComponent,
});

const CONTENT_TYPES: { value: ContentType; labelKey: string }[] = [
  { value: "anime", labelKey: "common:types.anime" },
  { value: "manga", labelKey: "common:types.manga" },
  { value: "book", labelKey: "common:types.book" },
  { value: "game", labelKey: "common:types.game" },
  { value: "movie", labelKey: "common:types.movie" },
  { value: "tv", labelKey: "common:types.tv" },
];

function buildSearchUrl(contentType: ContentType, query: string, filters: FilterParams, page: number): string {
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

function getItemsFromPage(page: any, contentType: ContentType): any[] {
  const data = page?.data;
  switch (contentType) {
    case "anime":
      return data?.animes?.items ?? [];
    case "manga":
      return data?.mangas?.items ?? [];
    case "book":
      return data?.books?.items ?? [];
    case "game":
      return data?.games?.items ?? [];
    case "movie":
      return data?.movies?.items ?? [];
    case "tv":
      return data?.tvShows?.items ?? [];
    default:
      return [];
  }
}

function getPaginationFromPage(page: any, contentType: ContentType) {
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

function RouteComponent() {
  const { t } = useTranslation();
  const [contentType, setContentType] = useState<ContentType>("anime");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterParams>({});

  const debouncedQuery = useDebounce(searchQuery, 400);

  const handleFilterChange = useCallback((patch: Partial<FilterParams>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleContentTypeChange = (value: string) => {
    setContentType(value as ContentType);
    setFilters({});
  };

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["search", contentType, debouncedQuery, filters],
    queryFn: ({ pageParam }) => api.get(buildSearchUrl(contentType, debouncedQuery, filters, pageParam as number)),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = getPaginationFromPage(lastPage, contentType);
      return pagination?.hasNextPage ? pagination.nextCursor : undefined;
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

  const items = data?.pages.flatMap((p) => getItemsFromPage(p, contentType)) ?? [];

  return (
    <div className="p-4 sm:p-6">
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
            <Clipboard
              className="size-5 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-primary transition"
              onClick={handlePaste}
            />
          </div>
        </div>

        <div className="flex max-sm:flex-col gap-5">
          <Filters type={contentType} values={filters} onChange={handleFilterChange} />

          <div className="flex-1 md:w-2/3 space-y-4">
            {isError && <ErrorComponent />}
            {isLoading && <LoadingFiltered />}

            {!isLoading && !isError && (
              <Grid minColSize="128px" className="grid gap-6">
                {items.map((item: any) => (
                  <CardItem
                    key={item.malId ?? item.id}
                    title={item.title ?? item.name}
                    url={`/${contentType}/${item.malId ?? item.id}`}
                    imageURL={
                      (item.imageUrl ?? item.coverImage ?? "").replace(
                        "https://myanimelist.net/img/sp/icon/apple-touch-icon-256.png",
                        "/placeholder/cover.webp",
                      ) || "/placeholder/cover.webp"
                    }
                    rating={item.rating != null ? +item.rating : undefined}
                    year={
                      (item.airedFrom ?? item.releasedAt ?? item.publishedAt)
                        ? new Date(item.airedFrom ?? item.releasedAt ?? item.publishedAt).getFullYear()
                        : undefined
                    }
                    synopsis={item.synopsis ?? item.description}
                    isAdult={item.isAdult}
                    mediaType={contentType}
                  />
                ))}
              </Grid>
            )}

            <div ref={sentinelRef} className="h-px" />
            {isFetchingNextPage && <LoadingFiltered />}
          </div>
        </div>
      </div>
    </div>
  );
}

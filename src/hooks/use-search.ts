import { useInfiniteQuery } from "@tanstack/react-query";
import { parseAsString, parseAsStringLiteral, useQueryState, useQueryStates } from "nuqs";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { ContentType, FilterParams } from "@/components/layouts/filters";
import { SEARCH_TYPES, type SearchType } from "@/constants/search";
import { useContentTypes } from "@/hooks/content-type";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth/client";
import { toContentTypeSlug } from "@/lib/content-types";
import { useDebounce } from "@/lib/utils/useDebounce";
import { useInfiniteScroll } from "@/lib/utils/useInfiniteScroll";
import type { FilterQueryState } from "@/utils/search";
import {
  buildSearchUrl,
  CLEARED_FILTER_QUERY,
  FILTER_QUERY_PARSERS,
  getItemsFromPage,
  getPaginationFromPage,
} from "@/utils/search";

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydratedSnapshot = () => false;

export function useSearch() {
  const hydrated = useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerHydratedSnapshot);
  const session = useSession();
  const { hiddenClass, visible } = useContentTypes();
  const preferredType = toContentTypeSlug(session.data?.user?.profile?.defaultSearchType ?? "Movie") ?? "movie";
  const defaultType = hydrated ? (visible.includes(preferredType) ? preferredType : visible[0]) : "movie";
  const [searchType, setSearchType] = useQueryState(
    "type",
    parseAsStringLiteral(SEARCH_TYPES.map((c) => c.value))
      .withDefault(defaultType)
      .withOptions({ clearOnDefault: false }),
  );

  const isUserSearch = searchType === "user";
  const isCastSearch = searchType === "cast";
  const isContentSearch = !isUserSearch && !isCastSearch;
  const contentType: ContentType = isUserSearch || isCastSearch ? "movie" : searchType;

  const [searchQuery, setSearchQuery] = useQueryState("query", parseAsString.withDefault(""));
  const [filterQuery, setFilterQuery] = useQueryStates(FILTER_QUERY_PARSERS);

  const debouncedQuery = useDebounce(searchQuery, 600);

  const filters = useMemo<FilterParams>(
    () => ({
      minTgScore: filterQuery.minTgScore ?? undefined,
      type: filterQuery.format ?? undefined,
      status: filterQuery.status ?? undefined,
      genres: filterQuery.genres ?? undefined,
      year: filterQuery.year ?? undefined,
      sort: filterQuery.sort ?? undefined,
      gameMode: filterQuery.gameMode ?? undefined,
      platforms: filterQuery.platforms ?? undefined,
    }),
    [filterQuery],
  );

  const handleFilterChange = (patch: Partial<FilterParams>) => {
    const next: Partial<FilterQueryState> = {};

    if ("minTgScore" in patch) next.minTgScore = patch.minTgScore ?? null;
    if ("type" in patch) next.format = patch.type ?? null;
    if ("status" in patch) next.status = patch.status ?? null;
    if ("genres" in patch) next.genres = patch.genres ?? null;
    if ("year" in patch) next.year = patch.year ?? null;
    if ("sort" in patch) next.sort = patch.sort ?? null;
    if ("gameMode" in patch) next.gameMode = patch.gameMode ?? null;
    if ("platforms" in patch) next.platforms = patch.platforms ?? null;

    setFilterQuery(next);
  };

  const handleSearchTypeChange = (value: string) => {
    setSearchType(value as SearchType);
    setSearchQuery("");
    setFilterQuery(CLEARED_FILTER_QUERY);
  };

  useEffect(() => {
    if (!hydrated || !isContentSearch || visible.includes(contentType)) return;

    setSearchType(visible[0]);
    setSearchQuery("");
    setFilterQuery(CLEARED_FILTER_QUERY);
  }, [hydrated, isContentSearch, contentType, visible, setSearchType, setSearchQuery, setFilterQuery]);

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
    enabled: hydrated && isContentSearch && !session.isPending,
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

    return (data?.pages.flatMap((p) => getItemsFromPage(p, contentType)) ?? []).filter((item) => {
      const id = item.malId ?? item.tmdbId ?? item.hardcoverId ?? item.igdbId;

      if (id == null) return true;
      if (seen.has(id)) return false;

      seen.add(id);

      return true;
    });
  }, [data, contentType]);

  return {
    searchType,
    handleSearchTypeChange,
    hiddenClass: hydrated ? hiddenClass : () => "",
    searchQuery,
    setSearchQuery,
    handlePaste,
    isUserSearch,
    isCastSearch,
    debouncedQuery,
    contentType,
    filters,
    handleFilterChange,
    setFilterQuery,
    items,
    isLoading,
    isError,
    isFetchingNextPage,
    sentinelRef,
  };
}

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { type ApiTypes, api, apiEndpoints } from "@/lib/api.ts";

const ITEMS_PER_PAGE = 20;

export function xpQueryKey(username?: string) {
  return username ? ["xp", username] : ["xp", "me"];
}

export function xpHistoryQueryKey() {
  return ["xp", "history"];
}

export function useMyXp(enabled = true) {
  return useQuery({
    queryKey: xpQueryKey(),
    queryFn: () => api.get<ApiTypes.GetXpResponse>(apiEndpoints.getMyXp).then(({ data }) => data.xp),
    enabled,
  });
}

export function useXpByUsername(username: string, enabled = true) {
  return useQuery({
    queryKey: xpQueryKey(username),
    queryFn: () => api.get<ApiTypes.GetXpResponse>(apiEndpoints.getXpByUsername(username)).then(({ data }) => data.xp),
    enabled,
  });
}

export function useXpHistory() {
  return useInfiniteQuery({
    queryKey: xpHistoryQueryKey(),
    queryFn: ({ pageParam }) =>
      api
        .get<ApiTypes.GetXpHistoryResponse>(apiEndpoints.getXpHistory, {
          params: { page: pageParam, itemsPerPage: ITEMS_PER_PAGE },
        })
        .then(({ data }) => data.history),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.inPage < lastPage.pages ? lastPage.inPage + 1 : undefined),
  });
}
